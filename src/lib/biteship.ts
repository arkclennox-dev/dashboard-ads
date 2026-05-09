const BASE = "https://api.biteship.com";

function headers() {
  return {
    "content-type": "application/json",
    authorization: `Bearer ${process.env.BITESHIP_API_KEY ?? ""}`,
  };
}

export interface BiteshipArea {
  id: string;
  name: string;
  country_name: string;
  country_code: string;
  administrative_division_level_1_name: string;
  administrative_division_level_2_name: string;
  administrative_division_level_3_name: string;
  postal_code: number;
}

export interface BiteshipRate {
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  type: string;
  price: number;
  min_day: number;
  max_day: number;
}

export async function searchAreas(q: string): Promise<BiteshipArea[]> {
  const url = `${BASE}/v1/maps/areas?countries=ID&input=${encodeURIComponent(q)}&type=single`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.areas ?? []) as BiteshipArea[];
}

export async function getRates(args: {
  origin_area_id: string;
  destination_area_id: string;
  weight_gram: number;
  item_value: number;
}): Promise<BiteshipRate[]> {
  const res = await fetch(`${BASE}/v1/rates/couriers`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      origin_area_id: args.origin_area_id,
      destination_area_id: args.destination_area_id,
      couriers: "jne,jnt,sicepat,anteraja,tiki,lion,ninja,pos",
      items: [{ name: "Item", value: args.item_value, weight: args.weight_gram }],
    }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  const pricing: BiteshipRate[] = [];
  for (const courier of json.pricing ?? []) {
    for (const svc of courier.courier_service_name ? [courier] : (courier.services ?? [])) {
      pricing.push({
        courier_name: courier.courier_name ?? svc.courier_name,
        courier_code: courier.courier_code ?? svc.courier_code,
        courier_service_name: svc.courier_service_name ?? svc.service_name,
        courier_service_code: svc.courier_service_code ?? svc.service_code,
        type: svc.type ?? "",
        price: svc.price ?? 0,
        min_day: svc.shipment_duration_range?.split(" ")[0] ?? svc.min_day ?? 0,
        max_day: svc.shipment_duration_range?.split(" ")[2] ?? svc.max_day ?? 0,
      });
    }
  }
  return pricing.sort((a, b) => a.price - b.price);
}
