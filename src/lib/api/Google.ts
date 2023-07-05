import { generateURL } from '../url';
import ApiInterface, { ApiInfo, UserProfile } from './apiInterface';
import axios, { AxiosRequestConfig } from 'axios';

interface googleAPIInfo extends ApiInfo {
  apiBaseUrl: string;
  authBaseUrl: string;
  accessTokenBaseUrl: string;
  redirectUrl: string;
  state: string;
}

class GoogleInterface extends ApiInterface {
  apiBaseUrl: string;
  authBaseUrl: string;
  accessTokenBaseUrl: string;
  redirectUrl: string;
  state: string;

  constructor(apiInfo: googleAPIInfo) {
    super(apiInfo);
    this.apiBaseUrl = apiInfo.apiBaseUrl;
    this.authBaseUrl = apiInfo.authBaseUrl;
    this.redirectUrl = apiInfo.redirectUrl;
    this.accessTokenBaseUrl = apiInfo.accessTokenBaseUrl;
    this.state = apiInfo.state;
  }

  get authCodeURL() {
    return generateURL(`${this.authBaseUrl}`, {
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUrl,
      //whethe access token request return refresh token.
      //if 'online', access token request will only return access_token
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/userinfo.profile',
      state: this.state,
    });
  }

  tokenURL(code: string) {
    return generateURL(this.accessTokenBaseUrl, {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUrl,
    });
  }

  async getTokens(code: string) {
    const endpoint = this.tokenURL(code);

    const reqConfig: AxiosRequestConfig = {
      url: endpoint,
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    };

    const response = await axios(reqConfig);

    const { access_token, refresh_token, expires_in } = response.data;

    return {
      access_token,
      refresh_token,
      expires_in,
    };
  }

  async getUserProfile(accessToken: string) {
    const endpoint = generateURL(`https://people.googleapis.com/v1/people/me`, {
      personFields: 'photos,names',
    });

    const reqConfig: AxiosRequestConfig = {
      url: endpoint,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    };

    const response = await axios(reqConfig);

    const data = response.data;

    const resourceName = data.resourceName as string;

    const profile: UserProfile = {
      id: resourceName.split('/')[1],
      username: data.names[0].displayName,
      pfp: data.photos[0].url,
    };

    return profile;
  }
}

export default GoogleInterface;
