/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { HttpService } from "@nestjs/axios";
import {
  AxiosInstance,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { Observable } from "rxjs";

/**
 * Fake HttpService to stub out HTTP calls in tests
 *
 * The ts-ignore is because this class implements with a protected member
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class HttpServiceFake implements HttpService {
  protected readonly instance: AxiosInstance;

  get axiosRef(): AxiosInstance {
    return undefined;
  }

  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return undefined;
  }

  get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return undefined;
  }

  head<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return undefined;
  }

  protected makeObservable<T>(
    axios: (...args: any[]) => AxiosPromise<T>,
    ...args: any[]
  ): Observable<AxiosResponse<T>> {
    return undefined;
  }

  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return undefined;
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return undefined;
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return undefined;
  }

  request<T = any>(config: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    return undefined;
  }
}
