import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import fs from 'fs/promises';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

function addToApplication(dom, xml) {
  const applicationNode = dom.getElementsByTagName('application')[0];
  const services = applicationNode.getElementsByTagName('service');

  for (let i = 0; i < services.length; i++) {
    const service = services[i];

    if (
      service.getAttribute('android:name') ===
      'za.co.mamamoney.assessments.frontend.MmFirebaseMessagingService'
    ) {
      console.log('MmFirebaseMessagingService already exists.');
      return dom;
    }
  }

  const parser = new DOMParser();
  const fragment = parser.parseFromString(xml, 'application/xml').documentElement;
  applicationNode.appendChild(fragment);

  console.log('Added MmFirebaseMessagingService to manifest.');

  return dom;
}

async function addFcmService(manifestPath) {
  const manifestContent = await fs.readFile(manifestPath, 'utf-8');
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  let dom = parser.parseFromString(manifestContent, 'application/xml');

  dom = addToApplication(
    dom,
    `<service xmlns:android="http://schemas.android.com/apk/res/android" android:name="za.co.mamamoney.assessments.frontend.MmFirebaseMessagingService" android:exported="false">
      <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT"/>
      </intent-filter>
    </service>`
  );

  const updatedManifestContent = serializer.serializeToString(dom);
  await fs.writeFile(manifestPath, updatedManifestContent, 'utf-8');
  console.log("AndroidManifest patched.");
}

// Execute if run directly
// if (process.argv[1] === new URL(import.meta.url).pathname) {
if (process.argv[1] === __filename) {
  const manifestPath = process.argv[2] || './android/app/src/main/AndroidManifest.xml';
  addFcmService(manifestPath).catch(console.error);
}

export { addFcmService };
