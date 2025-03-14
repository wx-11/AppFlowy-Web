import { renderColor } from '@/utils/color';
import { EmojiMartData } from '@emoji-mart/data';
import axios from 'axios';

const http = axios.create();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pendingRequests: Map<string, Promise<any>> = new Map();

async function httpGet(url: string) {
  if(pendingRequests.has(url)) {
    return pendingRequests.get(url);
  }

  const request = http.get(url).then((res) => {
    pendingRequests.delete(url);
    return res;
  });

  pendingRequests.set(url, request);

  return request;
}

export async function randomEmoji(skin = 0) {
  const emojiData = await loadEmojiData();
  const emojis = (emojiData as EmojiMartData).emojis;
  const keys = Object.keys(emojis);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];

  return emojis[randomKey].skins[skin].native;
}

export async function loadEmojiData() {
  return import('@emoji-mart/data/sets/15/native.json');
}

export function isFlagEmoji(emoji: string) {
  return /\uD83C[\uDDE6-\uDDFF]/.test(emoji);
}

export enum ICON_CATEGORY {
  artificial_intelligence = 'artificial_intelligence',
  computer_devices = 'computer_devices',
  culture = 'culture',
  entertainment = 'entertainment',
  food_drink = 'food_drink',
  health = 'health',
  images_photography = 'images_photography',
  interface_essential = 'interface_essential',
  mail = 'mail',
  map_travel = 'map_travel',
  money_shopping = 'money_shopping',
  nature_ecology = 'nature_ecology',
  phone = 'phone',
  programing = 'programing',
  shipping = 'shipping',
  work_education = 'work_education',
}

let icons: Record<ICON_CATEGORY,
  {
    id: string;
    name: string;
    content: string;
    keywords: string[];
  }[]> | undefined;

export async function loadIcons(): Promise<
  Record<
    ICON_CATEGORY,
    {
      id: string;
      name: string;
      content: string;
      keywords: string[];
    }[]
  >
> {
  if(icons) {
    return icons;
  }

  return httpGet('/af_icons/icons.json').then((res) => {
    icons = res.data;
    return res.data;
  });
}

export async function getIconBase64(id: string, color: string) {
  try {
    const response = await httpGet(`/af_icons/${id}.svg`);

    let svgText = response.data as string;

    svgText = svgText.replace(/fill="[^"]*"/g, ``);
    svgText = svgText.replace('<svg', `<svg fill="${renderColor(color)}"`);

    const base64String = btoa(svgText);

    return `data:image/svg+xml;base64,${base64String}`;
  } catch(error) {
    console.error('Error setting favicon:', error);
    return '';
  }
}

export async function randomIcon() {
  const icons = await loadIcons();
  const categories = Object.keys(icons);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)] as ICON_CATEGORY;
  const randomIcon = icons[randomCategory][Math.floor(Math.random() * icons[randomCategory].length)];

  return randomIcon;
}

export async function getIcon(id: string) {
  const icons = await loadIcons();

  for(const category of Object.keys(icons)) {
    for(const icon of icons[category as ICON_CATEGORY]) {
      if(icon.id === id) {
        return icon;
      }
    }
  }

  return null;
}
