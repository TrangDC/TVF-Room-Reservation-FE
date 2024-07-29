// import { useQuery, QueryHookOptions, OperationVariables } from '@apollo/client';

// export function useAuthedQuery<TData, TVariables extends OperationVariables>(
//   options: QueryHookOptions<TData, TVariables>
// ) {
//   return useQuery<TData, TVariables>({
//     ...options,
//     error: (error) => {
//       if (error.networkError && 'statusCode' in error.networkError && error.networkError.statusCode === 401) {
//         // Handle 401 error
//         window.location.href = '/login';
//       }
//       if (options.onError) {
//         options.onError(error);
//       }
//     },
//   });
// }
