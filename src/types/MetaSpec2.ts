export interface MetaSpec2 {
  spec: number;
  authors: {
    name: string;
    role: string;
  }[];
  maven: Maven[];
  providers: ProviderData[];
}

interface UrlData {
  type: 'url',
  url: string;
  name: string;
  variants: string[];
}

interface IdentityData {
  type: 'identity',
  id: string;
  slug: string;
  name: string;
  variants: string[];
}

type ProviderData = UrlData | IdentityData;

interface Maven {
  name: string;
  url: string;
}