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

export async function searchAreas(q: string): Promise<{ areas: BiteshipArea[]; error?: string }> {
  if (!process.env.BITESHIP_API_KEY) {
    return { areas: [], error: "BITESHIP_API_KEY tidak dikonfigurasi" };
  }
  try {
    const url = `${BASE}/v1/maps/areas?countries=ID&input=${encodeURIComponent(q)}&type=single`;
    const res = await fetch(url, { headers: headers(), next: { revalidate: 0 } });
    const json = await res.json();
    if (!res.ok) {
      return { areas: [], error: `Biteship error ${res.status}: ${json.error ?? json.message ?? JSON.stringify(json)}` };
    }
    // Biteship returns { success, areas: [...] }
    const areas = (json.areas ?? json.data ?? []) as BiteshipArea[];
    return { areas };
  } catch (e) {
    return { areas: [], error: (e as Error).message };
  }
}

export async function getRates(args: {
  origin_area_id: string;
  destination_area_id: string;
  weight_gram: number;
  item_value: number;
}): Promise<{ rates: BiteshipRate[]; error?: string }> {
  if (!process.env.BITESHIP_API_KEY) {
    return { rates: [], error: "BITESHIP_API_KEY tidak dikonfigurasi" };
  }
  try {
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
    const json = await res.json();
    if (!res.ok) {
      return { rates: [], error: `Biteship error ${res.status}: ${json.error ?? json.message ?? JSON.stringify(json)}` };
    }
    const pricing: BiteshipRate[] = [];
    for (const courier of json.pricing ?? []) {
      // Biteship returns pricing with nested courier_service array or flat
      const services = courier.courier_service ?? courier.services ?? [courier];
      for (const svc of services) {
        if (!svc.price) continue;
        const minDay = Number(String(svc.shipment_duration_range ?? "").split(" ")[0]) || svc.min_day || 0;
        const maxDay = Number(String(svc.shipment_duration_range ?? "").split(" ").pop()) || svc.max_day || 0;
        pricing.push({
          courier_name: courier.courier_name ?? svc.courier_name ?? "",
          courier_code: courier.courier_code ?? svc.courier_code ?? "",
          courier_service_name: svc.courier_service_name ?? svc.service_name ?? "",
          courier_service_code: svc.courier_service_code ?? svc.service_code ?? "",
          type: svc.type ?? "",
          price: svc.price,
          min_day: minDay,
          max_day: maxDay,
        });
      }
    }
    return { rates: pricing.sort((a, b) => a.price - b.price) };
  } catch (e) {
    return { rates: [], error: (e as Error).message };
  }
}
