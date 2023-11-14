import React, { useCallback, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createStackNavigator,
  HeaderBackButton,
  TransitionPresets,
} from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { colors } from './colors';
import { LogContext, Log, Event, CancelType } from './components/LogContext';
import DiscoverReadersScreen from './screens/DiscoverReadersScreen';
import ReaderDisplayScreen from './screens/ReaderDisplayScreen';
import LocationListScreen from './screens/LocationListScreen';
import UpdateReaderScreen from './screens/UpdateReaderScreen';
import RefundPaymentScreen from './screens/RefundPaymentScreen';
import DiscoveryMethodScreen from './screens/DiscoveryMethodScreen';
import CollectCardPaymentScreen from './screens/CollectCardPaymentScreen';
import SetupIntentScreen from './screens/SetupIntentScreen';
import MerchantSelectScreen from './screens/MerchantSelectScreen';
import LogListScreen from './screens/LogListScreen';
import LogScreen from './screens/LogScreen';
import RegisterInternetReaderScreen from './screens/RegisterInternetReaderScreen';
import { LogBox } from 'react-native';

import DatabaseScreen from './screens/DatabaseScreen';
import type { Location, Reader } from '@stripe/stripe-terminal-react-native';

export type RouteParamList = {
  UpdateReader: {
    update: Reader.SoftwareUpdate;
    reader: Reader.Type;
    onDidUpdate: () => void;
  };
  LocationList: {
    onSelect: (location: Location) => void;
    showDummyLocation: boolean;
  };
  DiscoveryMethod: {
    onChange: (method: Reader.DiscoveryMethod) => void;
  };
  SetupIntent: {
    discoveryMethod: Reader.DiscoveryMethod;
  };
  DiscoverReaders: {
    simulated: boolean;
    discoveryMethod: Reader.DiscoveryMethod;
  };
  MerchantSelect: {
    onSelectMerchant: ({
      selectedAccountKey,
    }: {
      selectedAccountKey: string;
    }) => void;
  };
  CollectCardPayment: {
    simulated: boolean;
    discoveryMethod: Reader.DiscoveryMethod;
  };
  RefundPayment: {
    simulated: boolean;
    discoveryMethod: Reader.DiscoveryMethod;
  };
  Log: {
    event: Event;
    log: Log;
  };
};

LogBox.ignoreLogs([
  // https://reactnavigation.org/docs/5.x/troubleshooting#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state
  'Non-serializable values were found in the navigation state',
  // https://github.com/software-mansion/react-native-gesture-handler/issues/722
  'RCTBridge required dispatch_sync to load RNGestureHandlerModule. This may lead to deadlocks',
  // https://github.com/react-native-netinfo/react-native-netinfo/issues/486
  'new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method.',
  'new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method.',
]);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerTintColor: colors.white,
  headerStyle: {
    shadowOpacity: 0,
    backgroundColor: colors.blurple,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.slate,
  },
  headerTitleStyle: {
    color: colors.white,
  },
  headerBackTitleStyle: {
    color: colors.white,
  },
  cardOverlayEnabled: true,
  gesturesEnabled: true,
  ...Platform.select({
    ios: {
      ...TransitionPresets.ModalPresentationIOS,
    },
  }),
};

export default function App() {
  const TerminalStackScreen = () => {
    const [logs, setlogs] = useState<Log[]>([]);
    const [cancel, setCancel] = useState<CancelType | null>(null);
    const clearLogs = useCallback(() => setlogs([]), []);

    const addLogs = useCallback((newLog: Log) => {
      const updateLog = (log: Log) =>
        log.name === newLog.name
          ? { name: log.name, events: [...log.events, ...newLog.events] }
          : log;
      setlogs((prev) =>
        prev.length > 0 && prev[prev.length - 1].name === newLog.name
          ? prev.map(updateLog)
          : [...prev, newLog]
      );
    }, []);

    const value = useMemo(
      () => ({ logs, addLogs, clearLogs, cancel, setCancel }),
      [logs, addLogs, clearLogs, cancel, setCancel]
    );
    return (
      <LogContext.Provider value={value}>
        <Stack.Navigator
          screenOptions={screenOptions}
          initialRouteName="HomeScreen"
        >
          <Stack.Screen
            name="HomeScreen"
            options={{ headerTitle: 'Terminal' }}
            component={HomeScreen}
          />
          <Stack.Screen
            name="MerchantSelectScreen"
            options={{ headerTitle: 'Merchant Select' }}
            component={MerchantSelectScreen}
          />
          <Stack.Screen
            name="DiscoverReadersScreen"
            options={{ headerTitle: 'Discovery' }}
            component={DiscoverReadersScreen}
          />
          <Stack.Screen
            name="RegisterInternetReaderScreen"
            options={{
              headerTitle: 'Register Reader',
            }}
            component={RegisterInternetReaderScreen}
          />
          <Stack.Screen
            name="ReaderDisplayScreen"
            component={ReaderDisplayScreen}
          />
          <Stack.Screen
            name="LocationListScreen"
            options={{ headerTitle: 'Locations' }}
            component={LocationListScreen}
          />
          <Stack.Screen
            name="UpdateReaderScreen"
            options={{ headerTitle: 'Update Reader' }}
            component={UpdateReaderScreen}
          />
          <Stack.Screen
            name="RefundPaymentScreen"
            options={{
              headerTitle: 'Collect refund',
              headerBackAccessibilityLabel: 'payment-back',
            }}
            component={RefundPaymentScreen}
          />
          <Stack.Screen
            name="DiscoveryMethodScreen"
            component={DiscoveryMethodScreen}
          />
          <Stack.Screen
            name="CollectCardPaymentScreen"
            options={{
              headerTitle: 'Collect card payment',
              headerBackAccessibilityLabel: 'payment-back',
            }}
            component={CollectCardPaymentScreen}
          />
          <Stack.Screen
            name="SetupIntentScreen"
            options={{
              headerTitle: 'Collect SetupIntent',
              headerBackAccessibilityLabel: 'payment-back',
            }}
            component={SetupIntentScreen}
          />
          <Stack.Screen
            name="LogListScreen"
            options={({ navigation }) => ({
              headerTitle: 'Logs',
              headerBackAccessibilityLabel: 'logs-back',
              headerLeft: () => (
                <HeaderBackButton
                  onPress={() => navigation.navigate('Terminal')}
                />
              ),
            })}
            component={LogListScreen}
          />
          <Stack.Screen
            name="LogScreen"
            options={{
              headerTitle: 'Event',
              headerBackAccessibilityLabel: 'log-back',
            }}
            component={LogScreen}
          />
        </Stack.Navigator>
      </LogContext.Provider>
    );
  }

  const DatabaseStackScreen = () => {
    return (
      <Stack.Navigator
        screenOptions={screenOptions}
        initialRouteName="DatabaseScreen"
      >
        <Stack.Screen
          name="DatabaseScreen"
          options={{ headerTitle: 'Database' }}
          component={DatabaseScreen}
        />
      </Stack.Navigator>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor={colors.blurple_dark}
        barStyle="light-content"
        translucent
      />
      <NavigationContainer>
        <Tab.Navigator tabBarOptions={{ labelStyle: { fontSize: 15 } }}>
          <Tab.Screen
            name="Terminal"
            component={TerminalStackScreen}
            options={{
              tabBarLabel: 'Terminal',
            }}
          />
          <Tab.Screen
            name="Database"
            component={DatabaseStackScreen}
            options={{
              tabBarLabel: 'Database',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
