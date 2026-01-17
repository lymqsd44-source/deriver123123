import React, { useEffect, useState, useCallback } from "react";
import { Alert, Image, View, BackHandler, Linking, Platform } from "react-native";
import images from "../../../utils/images/images";
import styles from "./styles";
import { getValue, setValue, deleteValue } from "../../../utils/localstorage/index";
import { selfDriverData, settingDataGet, translateDataGet, taxidosettingDataGet } from "../../../api/store/action";
import { useDispatch, useSelector } from "react-redux";
import { useAppNavigation } from "../../../utils/navigation";
import DeviceInfo from "react-native-device-info";
import { AppDispatch } from "../../../api/store";
import { requestLocationPermission, requestNotificationPermission } from "../../../commonComponents/helper/permissionHelper";

export function Splash() {
  const { replace } = useAppNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { settingData, taxidoSettingData, translateData } = useSelector((state: any) => state.setting);
  const [splashImage, setSplashImage] = useState<string | null>(null);
  const [showNoInternet, setShowNoInternet] = useState(false);
  const { zoneValue } = useSelector((state: any) => state.zoneUpdate)

  useEffect(() => {
    const loadSplashImage = async () => {
      try {
        const cachedImage = await getValue('splashImage')
        if (cachedImage) {
          setSplashImage(cachedImage)
        }
      } catch (error) {
        console.log('Error loading splash image:', error);
      }
    }
    loadSplashImage()
  }, [])

  const proceedToNextScreen = useCallback(async () => {
    try {
      const token = await getValue("token");
      const versionCode = parseInt(await DeviceInfo.getBuildNumber(), 10);
      const requiredVersion = parseInt(taxidoSettingData?.taxido_values?.setting?.app_version, 10) || 0;
      const forceUpdate = taxidoSettingData?.taxido_values?.activation?.force_update === "1";

      if (forceUpdate && versionCode < requiredVersion) {
        Alert.alert(translateData?.updateRequired || "Update Required", translateData?.newVersions || "A new version is available.", [
          {
            text: "OK", onPress: () => {
              const url = Platform.OS === 'android' ? taxidoSettingData?.taxido_values?.setting?.play_store_url : taxidoSettingData?.taxido_values?.setting?.app_store_url;
              if (url) Linking.openURL(url);
            }
          },
        ]);
        return;
      }

      if (token) {
        await dispatch(selfDriverData());
        replace("TabNav");
      } else {
        replace("OnBoarding");
      }
    } catch (error) {
      console.log('Error proceeding to next screen:', error);
      replace("OnBoarding");
    }
  }, [dispatch, replace, taxidoSettingData, translateData]);

  useEffect(() => {
    const init = async () => {
      // 1. Request Location Permission Early
      const granted = await requestLocationPermission();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Location permission is needed to continue.",
          [
            { text: "Open Settings", onPress: () => Linking.openSettings() },
            { text: "Exit", style: "destructive", onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false }
        );
        return;
      }

      // 2. Request Notifications (non-blocking)
      try { await requestNotificationPermission(); } catch { }

      // 3. Fetch Initial Data
      try {
        await dispatch(taxidosettingDataGet());
        const res = await dispatch(settingDataGet()).unwrap();
        if (res?._status === 500) {
          replace('NoInternalServer');
          return;
        }
        await dispatch(translateDataGet());
        await dispatch(selfDriverData());
      } catch (error) {
        console.log('Fetch data error:', error);
      }

      // 4. Final navigation check
      proceedToNextScreen();
    };

    init();
  }, [dispatch, proceedToNextScreen, replace]);

  useEffect(() => {
    const updateSplashImage = async () => {
      const serverImage = taxidoSettingData?.taxido_values?.setting?.driver_splash_screen_url
      try {
        if (serverImage && typeof serverImage === 'string') {
          await setValue('splashImage', serverImage)
        } else {
          await deleteValue('splashImage')
        }
      } catch (error) {
      }
    }
    if (taxidoSettingData) {
      updateSplashImage()
    }
  }, [taxidoSettingData])

  useEffect(() => {
    const activation = settingData?.values?.activation;
    const maintenance_mode = activation?.maintenance_mode;
    if (maintenance_mode === '1' || maintenance_mode === 1) {
      setShowNoInternet(true);
    }
  }, [settingData]);

  if (showNoInternet) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Image
          source={images.noInternet}
          style={{ width: 200, height: 200, resizeMode: 'contain' }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={splashImage ? { uri: splashImage } : images.splashDriver}
          style={styles.img}
          onError={() => {
            setSplashImage(null)
            deleteValue('splashImage')
          }}
        />
      </View>
    </View>
  )
}
