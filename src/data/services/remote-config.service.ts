// src/data/services/remote-config.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  private initialized = false;

  private async ensureInit() {
    if (this.initialized) return;
    const { initializeApp } = await import('firebase/app');
    const { getRemoteConfig } = await import('firebase/remote-config');
    const app = initializeApp(environment.firebaseConfig);
    const rc = getRemoteConfig(app);
    rc.settings = { minimumFetchIntervalMillis: 0, fetchTimeoutMillis: 60000 };
    this.initialized = true;
  }

  async fetchFlag(key: string, fallback: boolean) {
    try {
      await this.ensureInit();
      const { fetchAndActivate, getValue, getRemoteConfig } = await import('firebase/remote-config');
      const rc = getRemoteConfig();
      await fetchAndActivate(rc);
      const v = getValue(rc, key).asString();
      if (v === 'true') return true;
      if (v === 'false') return false;
      return fallback;
    } catch {
      return fallback;
    }
  }
}
