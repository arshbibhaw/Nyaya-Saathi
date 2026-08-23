export interface LocationOption {
  value: string;
  label: string;
  category: "State" | "Union Territory";
}

export const INDIAN_STATES: LocationOption[] = [
  { value: "andhra_pradesh", label: "Andhra Pradesh", category: "State" },
  { value: "arunachal_pradesh", label: "Arunachal Pradesh", category: "State" },
  { value: "assam", label: "Assam", category: "State" },
  { value: "bihar", label: "Bihar", category: "State" },
  { value: "chhattisgarh", label: "Chhattisgarh", category: "State" },
  { value: "goa", label: "Goa", category: "State" },
  { value: "gujarat", label: "Gujarat", category: "State" },
  { value: "haryana", label: "Haryana", category: "State" },
  { value: "himachal_pradesh", label: "Himachal Pradesh", category: "State" },
  { value: "jharkhand", label: "Jharkhand", category: "State" },
  { value: "karnataka", label: "Karnataka", category: "State" },
  { value: "kerala", label: "Kerala", category: "State" },
  { value: "madhya_pradesh", label: "Madhya Pradesh", category: "State" },
  { value: "maharashtra", label: "Maharashtra", category: "State" },
  { value: "manipur", label: "Manipur", category: "State" },
  { value: "meghalaya", label: "Meghalaya", category: "State" },
  { value: "mizoram", label: "Mizoram", category: "State" },
  { value: "nagaland", label: "Nagaland", category: "State" },
  { value: "odisha", label: "Odisha", category: "State" },
  { value: "punjab", label: "Punjab", category: "State" },
  { value: "rajasthan", label: "Rajasthan", category: "State" },
  { value: "sikkim", label: "Sikkim", category: "State" },
  { value: "tamil_nadu", label: "Tamil Nadu", category: "State" },
  { value: "telangana", label: "Telangana", category: "State" },
  { value: "tripura", label: "Tripura", category: "State" },
  { value: "uttar_pradesh", label: "Uttar Pradesh", category: "State" },
  { value: "uttarakhand", label: "Uttarakhand", category: "State" },
  { value: "west_bengal", label: "West Bengal", category: "State" },
];

export const UNION_TERRITORIES: LocationOption[] = [
  { value: "andaman_nicobar", label: "Andaman and Nicobar Islands", category: "Union Territory" },
  { value: "chandigarh", label: "Chandigarh", category: "Union Territory" },
  { value: "dadra_nagar_haveli_daman_diu", label: "Dadra and Nagar Haveli and Daman and Diu", category: "Union Territory" },
  { value: "delhi", label: "Delhi (NCT)", category: "Union Territory" },
  { value: "jammu_kashmir", label: "Jammu and Kashmir", category: "Union Territory" },
  { value: "ladakh", label: "Ladakh", category: "Union Territory" },
  { value: "lakshadweep", label: "Lakshadweep", category: "Union Territory" },
  { value: "puducherry", label: "Puducherry", category: "Union Territory" },
];

export const ALL_INDIAN_LOCATIONS: LocationOption[] = [
  ...INDIAN_STATES,
  ...UNION_TERRITORIES,
];
