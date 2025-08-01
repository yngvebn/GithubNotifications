import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Chrome API availability check
declare let chrome: any;

interface GitHubConfig {
  username: string;
  token: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);

  config: GitHubConfig = {
    username: '',
    token: ''
  };

  displayMessage = false;
  loading = false;
  error: string | null = null;

  async ngOnInit() {
    await this.loadConfig();
  }

  private async loadConfig() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['github_config']);
        if (result.github_config) {
          this.config = { ...result.github_config };
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  async onSave() {
    if (!this.config.token.trim()) {
      this.error = 'Please provide a GitHub token';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      // Validate token by fetching user info
      const headers = new HttpHeaders({
        'Authorization': `TOKEN ${this.config.token}`
      });

      const userResponse = await this.http.get<any>('https://api.github.com/user', { headers }).toPromise();

      if (userResponse) {
        this.config.username = userResponse.login;

        // Save to storage
        if (typeof chrome !== 'undefined' && chrome.storage) {
          await chrome.storage.local.set({ github_config: this.config });

          // Notify background script
          if (chrome.runtime) {
            chrome.runtime.sendMessage({ type: 'CONFIG_UPDATED' });
          }
        }

        // Show success message
        this.displayMessage = true;
        setTimeout(() => {
          this.displayMessage = false;
        }, 3000);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      this.error = 'Invalid token or network error. Please check your token and try again.';
    } finally {
      this.loading = false;
    }
  }

  onTokenChange() {
    this.error = null;
  }
}
