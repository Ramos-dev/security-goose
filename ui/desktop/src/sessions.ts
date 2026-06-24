import { Session, startAgent, ExtensionConfig, readConfig, setConfigProvider } from './api';
import { DEFAULT_CHAT_TITLE } from './contexts/ChatContext';
import type { setViewType } from './hooks/useNavigation';
import type { FixedExtensionEntry } from './components/ConfigContext';
import { AppEvents } from './constants/events';
import { getConfiguredDefaultPredefinedModel } from './components/settings/models/predefinedModelsUtils';
import { USE_ACP_CHAT } from './acpChatFeatureFlag';
import { acpChatSessionController } from './acp/chatSessionController';
import { getConfiguredGooseExtensions, gooseExtensionName } from './acp/extensions';

export function getSessionDisplayName(session: Session): string {
  if (session.user_set_name) {
    return session.name;
  }
  if (session.recipe?.title) {
    return session.recipe.title;
  }
  if (shouldShowNewChatTitle(session)) {
    return DEFAULT_CHAT_TITLE;
  }
  return session.name;
}

export function shouldShowNewChatTitle(session: Session): boolean {
  return !session.user_set_name && session.message_count === 0 && !session.recipe?.title;
}

export function resumeSession(session: Session, setView: setViewType) {
  const eventDetail = {
    sessionId: session.id,
    initialMessage: undefined,
  };

  window.dispatchEvent(
    new CustomEvent(AppEvents.ADD_ACTIVE_SESSION, {
      detail: eventDetail,
    })
  );

  setView('pair', {
    disableAnimation: true,
    resumeSessionId: session.id,
  });
}

function getDesktopFallbackModelAndProvider(): { provider: string; model: string } {
  const defaultPredefinedModel = getConfiguredDefaultPredefinedModel();
  const configuredProvider = window.appConfig?.get('GOOSE_DEFAULT_PROVIDER');
  const configuredModel = window.appConfig?.get('GOOSE_DEFAULT_MODEL');

  return {
    provider:
      typeof configuredProvider === 'string' && configuredProvider.trim()
        ? configuredProvider.trim()
        : (defaultPredefinedModel?.provider ?? ''),
    model:
      typeof configuredModel === 'string' && configuredModel.trim()
        ? configuredModel.trim()
        : (defaultPredefinedModel?.name ?? ''),
  };
}

async function readConfigString(key: string): Promise<string> {
  const response = await readConfig({
    body: {
      key,
      is_secret: false,
    },
  });

  return typeof response.data === 'string' ? response.data.trim() : '';
}

export async function ensureSessionProviderAndModelConfigured(): Promise<void> {
  const [currentProvider, currentModel] = await Promise.all([
    readConfigString('GOOSE_PROVIDER'),
    readConfigString('GOOSE_MODEL'),
  ]);

  if (currentProvider && currentModel) {
    return;
  }

  const fallback = getDesktopFallbackModelAndProvider();
  const nextProvider = currentProvider || fallback.provider;
  const nextModel =
    currentModel || (currentProvider && currentProvider !== fallback.provider ? '' : fallback.model);

  if (!nextProvider || !nextModel) {
    return;
  }

  await setConfigProvider({
    body: {
      provider: nextProvider,
      model: nextModel,
    },
    throwOnError: true,
  });
}

interface CreateSessionOptions {
  recipeDeeplink?: string;
  recipeId?: string;
  extensionConfigs?: ExtensionConfig[];
  allExtensions?: FixedExtensionEntry[];
}

function selectedExtensionConfigs(options?: CreateSessionOptions): ExtensionConfig[] {
  if (options?.extensionConfigs && options.extensionConfigs.length > 0) {
    return options.extensionConfigs;
  }
  if (options?.allExtensions) {
    return options.allExtensions
      .filter((extension) => extension.enabled)
      .map((extension) => {
        const { enabled: _enabled, ...config } = extension;
        return config as ExtensionConfig;
      });
  }
  return [];
}

async function createAcpSession(
  workingDir: string,
  options?: CreateSessionOptions
): Promise<Session> {
  const selectedNames = new Set(selectedExtensionConfigs(options).map((config) => config.name));
  const gooseExtensions =
    selectedNames.size > 0
      ? (await getConfiguredGooseExtensions())
          .filter((entry) => selectedNames.has(gooseExtensionName(entry.extension)))
          .map((entry) => entry.extension)
      : [];
  return acpChatSessionController.createSession(workingDir, gooseExtensions, {
    recipeId: options?.recipeId,
    recipeDeeplink: options?.recipeDeeplink,
  });
}

export async function createSession(
  workingDir: string,
  options?: CreateSessionOptions
): Promise<Session> {
  if (USE_ACP_CHAT) {
    return createAcpSession(workingDir, options);
  }

  const body: {
    working_dir: string;
    recipe_deeplink?: string;
    recipe_id?: string;
    extension_overrides?: ExtensionConfig[];
  } = {
    working_dir: workingDir,
  };

  if (options?.recipeId) {
    body.recipe_id = options.recipeId;
  } else if (options?.recipeDeeplink) {
    body.recipe_deeplink = options.recipeDeeplink;
  }

  const extensionConfigs = selectedExtensionConfigs(options);
  if (extensionConfigs.length > 0) {
    body.extension_overrides = extensionConfigs;
  }

  await ensureSessionProviderAndModelConfigured();

  const newAgent = await startAgent({
    body,
    throwOnError: true,
  });
  return newAgent.data;
}

export async function startNewSession(
  initialText: string | undefined,
  setView: setViewType,
  workingDir: string,
  options?: {
    recipeDeeplink?: string;
    recipeId?: string;
    allExtensions?: FixedExtensionEntry[];
  }
): Promise<Session> {
  const session = await createSession(workingDir, options);
  window.dispatchEvent(new CustomEvent(AppEvents.SESSION_CREATED, { detail: { session } }));

  const initialMessage = initialText ? { msg: initialText, images: [] } : undefined;

  const eventDetail = {
    sessionId: session.id,
    initialMessage,
  };

  window.dispatchEvent(
    new CustomEvent(AppEvents.ADD_ACTIVE_SESSION, {
      detail: eventDetail,
    })
  );

  setView('pair', {
    disableAnimation: true,
    initialMessage,
    resumeSessionId: session.id,
  });
  return session;
}
