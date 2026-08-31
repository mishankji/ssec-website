/**
 * CPCB e-waste category codes for the Form-6 "Description of E-Waste" field,
 * transcribed from the company's Item Code List reference (ITEW/CEEW/LSEEW/
 * EETW/LIW categories under the E-Waste (Management) Rules Schedule I).
 *
 * NOTE on accuracy: the source PDF is a scanned/rasterized spreadsheet (no
 * selectable text), with codes as rotated column headers and long entries
 * merged across multiple sub-lines. Every entry below was read from a
 * high-resolution re-render of that file. Two entries required reassembling
 * several rotated text fragments (ITEW17 and CEEW13, both flagged below) --
 * worth a quick compare against your source if these are ever amended.
 * A handful of codes are intentionally repeated (ITEW15, ITEW24, ITEW25,
 * i.e. two sub-items sharing one code) because that's how they appear in
 * the source list, not a transcription error.
 */

export interface Form6ItemCode {
  /** Unique dropdown key (a few codes repeat, so this isn't always == code). */
  id: string;
  code: string;
  description: string;
}

export const FORM6_ITEM_CODES: Form6ItemCode[] = [
  // -- IT and Telecommunication Equipment --
  { id: "ITEW1", code: "ITEW1", description: "Centralized Data Processing: Mainframe" },
  { id: "ITEW2", code: "ITEW2", description: "Personal Computing: Personal Computers (Central Processing Unit with input and output devices)" },
  { id: "ITEW3", code: "ITEW3", description: "Personal Computing: Laptop Computers (Central Processing Unit with input and output devices)" },
  { id: "ITEW4", code: "ITEW4", description: "Personal Computing: Notebook Computers" },
  { id: "ITEW5", code: "ITEW5", description: "Personal Computing: Notepad Computers" },
  { id: "ITEW6", code: "ITEW6", description: "Printers including Cartridges" },
  { id: "ITEW7", code: "ITEW7", description: "Copying Equipment" },
  { id: "ITEW8", code: "ITEW8", description: "Electrical and Electronic Typewriters" },
  { id: "ITEW9", code: "ITEW9", description: "User Terminals and Systems" },
  { id: "ITEW10", code: "ITEW10", description: "Facsimile" },
  { id: "ITEW11", code: "ITEW11", description: "Telex" },
  { id: "ITEW12", code: "ITEW12", description: "Telephones" },
  { id: "ITEW13", code: "ITEW13", description: "Pay Telephones" },
  { id: "ITEW14", code: "ITEW14", description: "Cordless Telephones" },
  { id: "ITEW15-1", code: "ITEW15", description: "Cellular Telephones : Feature Phones" },
  { id: "ITEW15-2", code: "ITEW15", description: "Cellular Telephones : Smart phones" },
  { id: "ITEW16", code: "ITEW16", description: "Answering Systems" },
  // ITEW17: reassembled from a merged, multi-line rotated cell -- verify against source if amended.
  {
    id: "ITEW17",
    code: "ITEW17",
    description:
      "Products or equipment of Transmitting sound, images or other information by Telecommunications and Bluetooth enabled devices - Smart Watch/ Fitness Band, Bluetooth Headset, Virtual Reality Camera, etc; Products or equipment for the purpose of recording or reproducing sound or images including signals and other technologies for the distribution of sound and image by telecommunications - Telecommunications Antenna / Transmitters / Wi-Fi/wireless enabled Devices / Radio/Satellite Telephone; Walkie Talkie",
  },
  { id: "ITEW18", code: "ITEW18", description: "BTS (all components excluding structure of tower)" },
  { id: "ITEW19", code: "ITEW19", description: "Tablets, I-PAD" },
  { id: "ITEW20", code: "ITEW20", description: "Phablets" },
  { id: "ITEW21", code: "ITEW21", description: "Scanners" },
  { id: "ITEW22", code: "ITEW22", description: "Routers - Routers, Access Point and Controller, LAN Switches, SDWAN, IoT Gateway, etc" },
  { id: "ITEW23", code: "ITEW23", description: "GPS" },
  { id: "ITEW24-1", code: "ITEW24", description: "UPS -upto 2 KVA" },
  { id: "ITEW24-2", code: "ITEW24", description: "UPS -greater than 2 KVA" },
  { id: "ITEW25-1", code: "ITEW25", description: "INVERTER -upto 2 KVA" },
  { id: "ITEW25-2", code: "ITEW25", description: "INVERTER -greater than 2 KVA" },
  { id: "ITEW26", code: "ITEW26", description: "Modems" },
  {
    id: "ITEW27",
    code: "ITEW27",
    description:
      "Electronic Data Storage Devices for Flash Drive (small devices); Electronic Data Storage Devices for large drive like server",
  },

  // -- Consumer Electrical and Electronic Equipment --
  { id: "CEEW1", code: "CEEW1", description: "Television sets (including sets based on Liquid Crystal Display and Light Emitting Diode technology)" },
  { id: "CEEW2", code: "CEEW2", description: "Refrigerator" },
  { id: "CEEW3", code: "CEEW3", description: "Washing Machine" },
  { id: "CEEW4", code: "CEEW4", description: "Air-conditioners excluding Centralized Air Conditioning Plants" },
  { id: "CEEW5", code: "CEEW5", description: "Fluorescent and other Mercury containing lamps" },
  { id: "CEEW6", code: "CEEW6", description: "Screen, Electronic Photo Frames, Electronic Display Panel, Monitors" },
  { id: "CEEW7", code: "CEEW7", description: "Radio Sets" },
  { id: "CEEW8", code: "CEEW8", description: "Set Top Boxes" },
  { id: "CEEW9", code: "CEEW9", description: "Video Cameras" },
  { id: "CEEW10", code: "CEEW10", description: "Video Recorders" },
  { id: "CEEW11", code: "CEEW11", description: "Hi-Fi Recorders" },
  { id: "CEEW12", code: "CEEW12", description: "Audio Amplifiers- Speakers, Multi Media Speaker, Home Theatre, Sound Bar, Wireless Speaker etc" },
  // CEEW13: reassembled from a merged, multi-line rotated cell -- verify against source if amended.
  {
    id: "CEEW13",
    code: "CEEW13",
    description:
      "Other Products or Equipment for the purpose of recording or reproducing sound or images including signals and other technologies for the distribution of sound and image by telecommunications - CCTV Camera with DVR & NVR / Projector / Digital Sound and Video Recorder and Player; HDCOM used for video conferencing",
  },
  { id: "CEEW14", code: "CEEW14", description: "Solar Panels/Cells, Solar Photovoltaic Panels/Cells/Modules." },
  { id: "CEEW15", code: "CEEW15", description: "Luminaires for fluorescent lamps with the exception of luminaires in households" },
  { id: "CEEW16", code: "CEEW16", description: "High intensity discharge lamps, including Pressure Sodium Lamps and Metal Halide Lamps" },
  { id: "CEEW17", code: "CEEW17", description: "Low pressure Sodium Lamps" },
  { id: "CEEW18", code: "CEEW18", description: "Other lighting or equipment for the purpose of spreading or controlling light excluding Filament Bulbs - LED Bulbs/Tubes/Consumer LED Drives" },
  { id: "CEEW19", code: "CEEW19", description: "Other lighting or equipment for the purpose of spreading or controlling light excluding Filament Bulbs - Professionals Luminaries & Drives" },

  // -- Large and Small Equipment (LSEEW) --
  { id: "LSEEW1", code: "LSEEW1", description: "Digital Camera" },
  { id: "LSEEW2", code: "LSEEW2", description: "Large cooling appliances" },
  { id: "LSEEW3", code: "LSEEW3", description: "Freezers" },
  { id: "LSEEW4", code: "LSEEW4", description: "Other large appliances used for refrigeration, conservation and storage of food" },
  { id: "LSEEW5", code: "LSEEW5", description: "Clothes Dryers" },
  { id: "LSEEW6", code: "LSEEW6", description: "Dish Washing Machines" },
  { id: "LSEEW7", code: "LSEEW7", description: "Electric Cookers" },
  { id: "LSEEW8", code: "LSEEW8", description: "Electric Stoves" },
  { id: "LSEEW9", code: "LSEEW9", description: "Electric Hot Plates" },
  { id: "LSEEW10", code: "LSEEW10", description: "Microwaves, Microwave Oven" },
  { id: "LSEEW11", code: "LSEEW11", description: "Other large appliances used for cooking and other processing of food" },
  { id: "LSEEW12", code: "LSEEW12", description: "Electric Heating Appliances" },
  { id: "LSEEW13", code: "LSEEW13", description: "Electric Radiators" },
  { id: "LSEEW14", code: "LSEEW14", description: "Other large appliances for heating Rooms, Beds, Seating Furniture" },
  { id: "LSEEW15", code: "LSEEW15", description: "Electric Fans" },
  { id: "LSEEW16", code: "LSEEW16", description: "Other Fanning, exhaust Ventilation and Conditioning Equipment" },
  { id: "LSEEW17", code: "LSEEW17", description: "Vacuum Cleaners; Carpet Sweepers" },
  { id: "LSEEW18", code: "LSEEW18", description: "Other appliances for cleaning" },
  { id: "LSEEW19", code: "LSEEW19", description: "Appliances used for sewing, knitting, weaving and other processing for textiles" },
  {
    id: "LSEEW20",
    code: "LSEEW20",
    description:
      "Iron and other appliances for ironing, mangling and other care of clothing - Dry Iron; Iron and other appliances for ironing, mangling and other care of clothing - Steam Iron/Garment Steamer",
  },
  { id: "LSEEW21", code: "LSEEW21", description: "Grinders, Coffee Machines and equipment for opening or sealing containers or packages" },
  { id: "LSEEW22", code: "LSEEW22", description: "Smoke Detector" },
  { id: "LSEEW23", code: "LSEEW23", description: "Heating Regulators" },
  { id: "LSEEW24", code: "LSEEW24", description: "Thermostats" },
  { id: "LSEEW25", code: "LSEEW25", description: "Automatic Dispensers for hot drinks" },
  { id: "LSEEW26", code: "LSEEW26", description: "Automatic Dispensers for hot or cold bottles or cans" },
  { id: "LSEEW27", code: "LSEEW27", description: "Automatic Dispensers for solid products" },
  { id: "LSEEW28", code: "LSEEW28", description: "Automatic Dispensers for money" },
  { id: "LSEEW29", code: "LSEEW29", description: "All appliances which deliver automatically all kinds of products" },
  { id: "LSEEW30", code: "LSEEW30", description: "Indoor Air Purifier" },
  { id: "LSEEW31", code: "LSEEW31", description: "Hair Dryer" },
  { id: "LSEEW32", code: "LSEEW32", description: "Electric Shaver" },
  { id: "LSEEW33", code: "LSEEW33", description: "Electric Kettle" },
  { id: "LSEEW34", code: "LSEEW34", description: "Electronic Display Panels/Board/Visual Display Unit" },

  // -- Electrical and Electronic Tools (EETW) --
  { id: "EETW1", code: "EETW1", description: "Drills" },
  { id: "EETW2", code: "EETW2", description: "Saws" },
  { id: "EETW3", code: "EETW3", description: "Sewing Machines" },
  { id: "EETW4", code: "EETW4", description: "Equipment for turning, milling, sanding, grinding, sawing, cutting, shearing, drilling, making holes, punching, folding, bending or similar processing of wood, metal and other materials" },
  { id: "EETW5", code: "EETW5", description: "Tools for riveting, nailing or screwing or removing rivets, nails, screws or similar uses" },
  { id: "EETW6", code: "EETW6", description: "Tools for welding, soldering, or similar use" },
  { id: "EETW7", code: "EETW7", description: "Equipment for spraying, spreading, dispersing or other treatment of liquid or gaseous substance by other means" },
  { id: "EETW8", code: "EETW8", description: "Tools for mowing or other gardening activities" },

  // -- Lighting/Instrumentation (LIW) --
  { id: "LIW1", code: "LIW1", description: "Gas Analyzer" },
  { id: "LIW2", code: "LIW2", description: "Equipment Having electrical and electronic components" },
];

export type Form6ItemUnit = "kg" | "pcs";

export interface Form6ItemInput {
  codeId: string;
  freeText?: string;
  unit: Form6ItemUnit;
  quantity: string;
}

const UNIT_LABEL: Record<Form6ItemUnit, string> = { kg: "kg", pcs: "pcs" };

/**
 * "pdf" keeps the full CPCB description (what prints on the Form-6 PDF).
 * "sheet" drops the description -- the Google Sheet only needs the code
 * itself, since its meaning is already known internally -- and shows
 * whatever free text was entered instead.
 */
export type Form6ItemValueMode = "pdf" | "sheet";

/**
 * Formats one item's display value for either destination:
 * - "pdf": "{CODE} - {description}{, free text} — {value} {kg or pcs}".
 * - "sheet": "{CODE} - {free text} — {value} {kg or pcs}" when free text was
 *   entered, or "{CODE} — {value} {kg or pcs}" when it wasn't.
 * Quantity is either/or -- one item is logged in weight OR count, never
 * both. Shared between the client form (live preview, "sheet" mode -- it
 * shows what will actually be recorded) and the submit API route
 * ("sheet" mode, the authoritative value saved) so they can never drift
 * apart. The PDF builds its own item lines directly in form6-pdf.ts rather
 * than calling this, but "pdf" mode is kept here so the two formats are
 * defined in exactly one place if that ever changes.
 */
export function formatForm6ItemValue(item: Form6ItemInput, mode: Form6ItemValueMode): string {
  const found = FORM6_ITEM_CODES.find((c) => c.id === item.codeId);
  if (!found) return "";
  const detail = item.freeText?.trim();
  const base =
    mode === "pdf"
      ? `${found.code} - ${found.description}${detail ? `, ${detail}` : ""}`
      : detail
        ? `${found.code} - ${detail}`
        : found.code;
  const qty = item.quantity?.trim();
  if (!qty) return base;
  return `${base} — ${qty} ${UNIT_LABEL[item.unit]}`;
}
