// import config from '@/libs/config'
// import {authService} from '@/libs/utils/authService'
import {localStorageHelper} from '../../utils/localStorage'
import axios, {AxiosRequestConfig} from 'axios'
// import {decode} from 'jsonwebtoken'

axios.defaults.baseURL = import.meta.env.VITE_SERVER_API

const client = async <T>(
	endpoint: string,
	requestConfig: AxiosRequestConfig,
) => {
	const accessToken = localStorageHelper.get<string>(
		localStorageHelper.LOCAL_STORAGE_KEYS.ACCESS_TOKEN,
	)

	const getHttpMethod = (data: string, method: string) => {
		if (method) return method
		if (data) return 'POST'
		return 'GET'
	}

	axios.defaults.headers.common['Authorization'] =
		accessToken ? `Bearer ${accessToken}` : undefined
	// if (accessToken) {
	// 	const decodedToken = decode(accessToken) as {exp: number}
	// 	if (decodedToken && decodedToken.exp * 1000 <= Date.now() - 500) {
	// 		await authService.refreshToken()
	// 	}
	// }
	return axios<T>(endpoint, {
		method: getHttpMethod(requestConfig.data, requestConfig.method ?? ''),
		data: requestConfig.data,
		params: requestConfig.params,
	})
		.then(response => {
			if (response.status === 403) {
				return Promise.reject(new Error('Please re-authenticate.'))
			}

			return response.data
		})
		.catch(async error => {
			// if (error.response.status === 403) {
			// 	//refresh token, if failed, logout
			// 	try {
			// 		await authService.refreshToken()
			// 	} catch (error) {
			// 		authService.logout()
			// 	}
			// }
			if (error.response) {
				return Promise.reject(error.response.data)
			} else if (error.request) {
				return Promise.reject(error.request)
			} else {
				return Promise.reject(error.message)
			}
		})
}

export default client