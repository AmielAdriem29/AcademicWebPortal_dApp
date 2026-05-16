export interface Institution {
  name: string;
  walletAddress: string;
}

export const INSTITUTIONS: Institution[] = [
  {
    name: 'Cebu Institute of Technology – University',
    walletAddress: 'addr_test1qqc76e0p3kfncru2z8exf5j6x8gwsduxwg088q9j05mk53wmp7qkqalrl0a05jsxgtkl5n9a67m23s4x92c8ydwhkxrsthzvmg',
  },
];

export function getInstitutionByWallet(walletAddress: string): Institution | undefined {
  return INSTITUTIONS.find(i => i.walletAddress === walletAddress);
}