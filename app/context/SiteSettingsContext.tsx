"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import cmsService, {
  FALLBACK_SITE_SETTINGS,
  type SiteSettings,
} from "../services/cmsService";

const SiteSettingsContext = createContext<SiteSettings>(FALLBACK_SITE_SETTINGS);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(FALLBACK_SITE_SETTINGS);

  useEffect(() => {
    let active = true;
    cmsService
      .getPublicSiteSettings()
      .then((data) => {
        if (active && data) {
          setSettings({
            ...FALLBACK_SITE_SETTINGS,
            ...data,
            deliveryBanner: {
              ...FALLBACK_SITE_SETTINGS.deliveryBanner,
              ...(data.deliveryBanner || {}),
            },
            footer: {
              ...FALLBACK_SITE_SETTINGS.footer,
              ...(data.footer || {}),
            },
            social: {
              ...FALLBACK_SITE_SETTINGS.social,
              ...(data.social || {}),
            },
            campaignNavLinks: data.campaignNavLinks || [],
          });
        }
      })
      .catch(() => {
        if (active) setSettings(FALLBACK_SITE_SETTINGS);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
