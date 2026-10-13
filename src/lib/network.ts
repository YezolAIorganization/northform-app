import { useNetInfo } from "@react-native-community/netinfo";

/** True only when the device reports no connection or no internet. */
export function useOffline(): boolean {
  const { isConnected, isInternetReachable } = useNetInfo();
  return isConnected === false || isInternetReachable === false;
}
