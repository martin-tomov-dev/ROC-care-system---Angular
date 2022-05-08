import { SETTINGS } from './settings';
import * as npm from '../../package.json';

let fbConfig;
if(new URL(window.location.href).searchParams.get('region') != 'uk'){
  fbConfig = {
    apiKey: "AIzaSyCtIqk2_SdywRQdonlhUvwW5lW33CbA2is",
    authDomain: "roc-care-systems-uk.firebaseapp.com",
    databaseURL: "https://roc-care-systems-uk-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "roc-care-systems-uk",
    storageBucket: "roc-care-systems-uk.appspot.com",
    messagingSenderId: "97548824532",
    appId: "1:97548824532:web:6c48c5d9f3dc668013f041",
    measurementId: "G-2V4LRJGDMY"
  }
}
else{
  fbConfig = {
    apiKey: "AIzaSyAXb3WS-zL728HNUS51ysYUqYec3zbyFvk",
    authDomain: "roc-care-systems-fc021.firebaseapp.com",
    databaseURL: "https://roc-care-systems-fc021.firebaseio.com",
    projectId: "roc-care-systems-fc021",
    storageBucket: "roc-care-systems-fc021.appspot.com",
    messagingSenderId: "1086486481363",
    appId: "1:1086486481363:web:e224d8cb63aea09bad0726"
  }
}
export const environment = {
  production: false,
  appSettings: SETTINGS,
  googleMapApiKey: 'AIzaSyBSvo0x8v3C6aFWcSi2zooOC9tqGCOqCj4',
  version: npm.version,
  firebaseConfig :fbConfig,
  server_url: 'http://192.168.1.50:8100/api'
};
