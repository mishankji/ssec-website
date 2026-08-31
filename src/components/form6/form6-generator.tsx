"use client";

import { useState, type FormEvent } from "react";
import { Download, Info, Loader2, Pencil, Plus, RefreshCcw } from "lucide-react";
import { ItemRow, type ItemRowState } from "./item-row";
import { generateForm6Pdf, type Form6PdfItem } from "@/lib/form6-pdf";
import { FORM6_ITEM_CODES } from "@/lib/form6-item-codes";
import type { ClientForm6Submission } from "@/lib/form6-client";

const inputClasses =
  "w-full rounded-lg border border-forest/15 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brass";

type TransportMode = "self" | "third-party";

function emptyItem(): ItemRowState {
  return {
    key: Math.random().toString(36).slice(2),
    codeId: "",
    freeText: "",
    unit: "kg",
    quantity: "",
  };
}

function emptySenderState() {
  return {
    senderName: "",
    senderAddress: "",
    senderPhone: "",
    senderAuthNo: "",
    manifestDocNo: "",
  };
}

const VEHICLE_TYPES = ["Special Vehicle", "Truck", "Tanker"] as const;

/**
 * Builds the form's local field state from either an existing submission
 * (editing/resubmitting -- prefills everything, including items from its
 * itemsJson) or null (a brand-new, blank form). Kept as one function so
 * "start new", "edit this", and "cancel back to what's saved" all shape
 * their fields identically.
 */
function fieldsFromSubmission(sub: ClientForm6Submission | null) {
  if (!sub) {
    return {
      sender: emptySenderState(),
      transportMode: "self" as TransportMode,
      transporterName: "",
      transporterAddress: "",
      transporterPhone: "",
      transporterRegNo: "",
      vehicleNumber: "",
      vehicleType: "",
      items: [emptyItem()],
    };
  }
  return {
    sender: {
      senderName: sub.senderName,
      senderAddress: sub.senderAddress,
      senderPhone: sub.senderPhone,
      senderAuthNo: sub.senderAuthNo,
      manifestDocNo: sub.manifestDocNo,
    },
    transportMode: sub.transportMode,
    transporterName: sub.transporterName,
    transporterAddress: sub.transporterAddress,
    transporterPhone: sub.transporterPhone,
    transporterRegNo: sub.transporterRegNo,
    vehicleNumber: sub.vehicleNumber,
    vehicleType: sub.vehicleType,
    items:
      sub.itemsJson.length > 0
        ? sub.itemsJson.map((it) => ({
            key: Math.random().toString(36).slice(2),
            codeId: it.codeId,
            freeText: it.freeText,
            unit: it.unit,
            quantity: it.quantity,
          }))
        : [emptyItem()],
  };
}

export function Form6Generator({
  submittedBy,
  initialSubmission,
  initialSubmissionError,
}: {
  submittedBy: string;
  initialSubmission: ClientForm6Submission | null;
  initialSubmissionError: string;
}) {
  const [mode, setMode] = useState<"status" | "form">(initialSubmission ? "status" : "form");
  const [submission, setSubmission] = useState<ClientForm6Submission | null>(initialSubmission);
  const [submissionError, setSubmissionError] = useState(initialSubmissionError);
  // Set while the form is editing/resubmitting an existing row (Rejected ->
  // resubmit, or Approved -> fix a typo); null means "this save creates a
  // brand-new submission".
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFields = fieldsFromSubmission(initialSubmission);
  const [sender, setSender] = useState(initialFields.sender);
  const [transportMode, setTransportMode] = useState<TransportMode>(initialFields.transportMode);
  const [transporterName, setTransporterName] = useState(initialFields.transporterName);
  const [transporterAddress, setTransporterAddress] = useState(initialFields.transporterAddress);
  const [transporterPhone, setTransporterPhone] = useState(initialFields.transporterPhone);
  const [transporterRegNo, setTransporterRegNo] = useState(initialFields.transporterRegNo);
  const [vehicleNumber, setVehicleNumber] = useState(initialFields.vehicleNumber);
  const [vehicleType, setVehicleType] = useState(initialFields.vehicleType);
  const [items, setItems] = useState<ItemRowState[]>(initialFields.items);

  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function applyFields(fields: ReturnType<typeof fieldsFromSubmission>) {
    setSender(fields.sender);
    setTransportMode(fields.transportMode);
    setTransporterName(fields.transporterName);
    setTransporterAddress(fields.transporterAddress);
    setTransporterPhone(fields.transporterPhone);
    setTransporterRegNo(fields.transporterRegNo);
    setVehicleNumber(fields.vehicleNumber);
    setVehicleType(fields.vehicleType);
    setItems(fields.items);
  }

  function startNewSubmission() {
    applyFields(fieldsFromSubmission(null));
    setEditingId(null);
    setErrorMessage("");
    setMode("form");
  }

  function startEditingCurrent() {
    if (!submission) return;
    applyFields(fieldsFromSubmission(submission));
    setEditingId(submission.submissionId);
    setErrorMessage("");
    setMode("form");
  }

  /** Discards any in-progress form edits and returns to the status view for whatever is currently saved. */
  function cancelEditing() {
    if (!submission) return;
    applyFields(fieldsFromSubmission(submission));
    setEditingId(null);
    setErrorMessage("");
    setMode("status");
  }

  function updateItem(index: number, next: ItemRowState) {
    setItems((prev) => prev.map((item, i) => (i === index ? next : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!sender.senderName.trim() || !sender.senderAddress.trim() || !sender.senderPhone.trim()) {
      setErrorMessage("Sender name, address, and phone are required.");
      return;
    }
    if (
      transportMode === "third-party" &&
      (!transporterName.trim() || !transporterAddress.trim() || !transporterPhone.trim() || !transporterRegNo.trim())
    ) {
      setErrorMessage(
        "Transporter name, address, phone, and registration No. / GST-PAN are required for third-party transport."
      );
      return;
    }
    if (!sender.manifestDocNo.trim()) {
      setErrorMessage("Manifest Document No. is required.");
      return;
    }
    if (!vehicleNumber.trim()) {
      setErrorMessage("Vehicle number is required.");
      return;
    }
    if (!vehicleType) {
      setErrorMessage("Please select a type of vehicle.");
      return;
    }
    for (const [i, item] of items.entries()) {
      if (!item.codeId) {
        setErrorMessage(`Item ${i + 1}: please select a CPCB code.`);
        return;
      }
      if (!item.quantity.trim()) {
        setErrorMessage(`Item ${i + 1}: quantity is required.`);
        return;
      }
    }

    setStatus("submitting");
    const itemsPayload = items.map(({ codeId, freeText, unit, quantity }) => ({
      codeId,
      freeText,
      unit,
      quantity,
    }));
    const payload = {
      ...sender,
      senderGst: sender.senderAuthNo,
      transportMode,
      transporterName,
      transporterAddress,
      transporterPhone,
      transporterRegNo,
      vehicleNumber,
      vehicleType,
      items: itemsPayload,
      ...(editingId ? { submissionId: editingId } : {}),
    };

    try {
      const res = await fetch(editingId ? "/api/form6/update" : "/api/form6/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong. Please try again.");

      if (editingId) {
        setSubmission(data.submission as ClientForm6Submission);
      } else {
        // A brand-new submission only gets back { submissionId } (it's
        // Pending, with no SR No. yet) -- build the client-shaped record
        // locally from exactly what was just sent, rather than a second
        // round trip to re-fetch it.
        setSubmission({
          submissionId: data.submissionId,
          status: "Pending",
          rejectionReason: "",
          formNumber: null,
          timestamp: new Date().toISOString(),
          senderName: sender.senderName,
          senderAddress: sender.senderAddress,
          senderPhone: sender.senderPhone,
          senderAuthNo: sender.senderAuthNo,
          transportMode,
          transporterName,
          transporterAddress,
          transporterPhone,
          transporterRegNo,
          vehicleNumber,
          vehicleType,
          manifestDocNo: sender.manifestDocNo,
          items: "",
          itemsJson: itemsPayload,
          submittedBy,
        });
      }
      setEditingId(null);
      setSubmissionError("");
      setStatus("idle");
      setMode("status");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  async function handleDownloadPdf() {
    if (!submission || submission.formNumber == null) return;
    const pdfItems: Form6PdfItem[] = items.map((item) => {
      const found = FORM6_ITEM_CODES.find((c) => c.id === item.codeId)!;
      return {
        code: found.code,
        description: found.description,
        freeText: item.freeText,
        unit: item.unit,
        quantity: item.quantity,
      };
    });
    const bytes = await generateForm6Pdf({
      formNumber: submission.formNumber,
      senderName: sender.senderName,
      senderAddress: sender.senderAddress,
      senderPhone: sender.senderPhone,
      senderAuthNo: sender.senderAuthNo,
      manifestDocNo: sender.manifestDocNo,
      transportMode,
      transporterName,
      transporterAddress,
      transporterPhone,
      transporterRegNo,
      vehicleNumber,
      vehicleType,
      items: pdfItems,
    });
    // pdf-lib's save() types its return as Uint8Array<ArrayBufferLike>, but
    // BlobPart wants the narrower Uint8Array<ArrayBuffer> -- a known TS/lib.dom
    // mismatch as of TS 5.6+. Re-wrapping copies into a fresh, plain
    // ArrayBuffer-backed Uint8Array, which satisfies BlobPart.
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Form6-SR${submission.formNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (mode === "status" && submission) {
    return (
      <div className="rounded-2xl border border-forest/10 bg-white p-8 text-center shadow-sm">
        {submission.status === "Pending" && (
          <>
            <h3 className="font-heading text-lg font-semibold text-forest">
              Form-6 submitted -- awaiting approval
            </h3>
            <p className="mt-2 text-sm text-ink/70">
              This has been sent to the owner for review. No SR No. is assigned and no PDF is
              available until it&apos;s approved -- check back here for the outcome.
            </p>
          </>
        )}

        {submission.status === "Rejected" && (
          <>
            <h3 className="font-heading text-lg font-semibold text-red-600">Form-6 rejected</h3>
            <p className="mt-2 text-sm text-ink/70">
              Reason: <span className="font-medium text-ink">{submission.rejectionReason}</span>
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={startEditingCurrent}
                className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-offwhite transition-colors hover:bg-forest/90"
              >
                Edit &amp; Resubmit
                <Pencil size={15} />
              </button>
            </div>
          </>
        )}

        {submission.status === "Approved" && (
          <>
            <h3 className="font-heading text-lg font-semibold text-forest">
              Form-6 approved -- SR No. {submission.formNumber}
            </h3>
            <p className="mt-2 text-sm text-ink/70">Download the PDF and print 4 copies, one per color:</p>
            <ul className="mx-auto mt-2 inline-block list-disc space-y-1 pl-5 text-left text-sm text-ink/70">
              <li>Copy 1 (Yellow): retained by sender.</li>
              <li>Copy 2 (Pink): retained by receiver.</li>
              <li>Copy 3 (Orange): retained by transporter.</li>
              <li>Copy 4 (Green): returned to sender by receiver.</li>
            </ul>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-offwhite transition-colors hover:bg-forest/90"
              >
                Download Form-6 PDF
                <Download size={15} />
              </button>
              <button
                type="button"
                onClick={startEditingCurrent}
                className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-6 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-sage/10"
              >
                Edit Submission
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={startNewSubmission}
                className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-6 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-sage/10"
              >
                New Form-6 Manifest
                <RefreshCcw size={15} />
              </button>
            </div>
          </>
        )}

        {submissionError && <p className="mt-4 text-sm text-red-600">{submissionError}</p>}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-2xl border border-forest/10 bg-white p-8 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forest/10 pb-5">
        <h2 className="font-heading text-xl font-semibold text-forest">
          {editingId ? "Edit Form-6 Manifest" : "New Form-6 Manifest"}
        </h2>
        {submission && (
          <button
            type="button"
            onClick={cancelEditing}
            className="text-sm font-semibold text-ink/50 hover:text-ink"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="flex gap-3 rounded-xl border border-sage/30 bg-sage/10 p-4 text-sm text-ink/70">
        <Info size={18} className="mt-0.5 shrink-0 text-forest" />
        <ul className="list-disc space-y-1.5 pl-4">
          <li>
            A <span className="font-semibold text-ink">CPCB code</span> identifies the category of
            e-waste under the CPCB E-Waste (Management) Rules, 2016 (for example, ITEW2 for
            personal computers). Pick the code that matches each item, and add a short note (like
            &quot;mouse&quot;) if it helps identify it.
          </li>
          <li>
            <span className="font-semibold text-ink">Self</span> transport means S S Enviro Care
            collects the e-waste directly. <span className="font-semibold text-ink">Third-party</span>{" "}
            transport means an outside transporter is moving it: you&apos;ll need their name,
            address, phone, and registration No. / GST-PAN.
          </li>
          <li>
            Every submission needs the owner&apos;s approval before its Form-6 PDF becomes
            available. You&apos;ll see the current status here once it&apos;s reviewed.
          </li>
          <li>
            Once approved, print the Form-6 PDF in 4 copies, one per color:
            <ul className="mt-1 list-[circle] space-y-1 pl-5">
              <li>Copy 1 (Yellow): retained by sender.</li>
              <li>Copy 2 (Pink): retained by receiver.</li>
              <li>Copy 3 (Orange): retained by transporter.</li>
              <li>Copy 4 (Green): returned to sender by receiver.</li>
            </ul>
          </li>
        </ul>
      </div>

      {/* Sender Details */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Sender Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-ink">Sender Name</label>
            <input
              type="text"
              required
              value={sender.senderName}
              onChange={(e) => setSender({ ...sender, senderName: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-ink">Address</label>
            <input
              type="text"
              required
              value={sender.senderAddress}
              onChange={(e) => setSender({ ...sender, senderAddress: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Phone</label>
            <input
              type="tel"
              required
              inputMode="numeric"
              maxLength={10}
              value={sender.senderPhone}
              onChange={(e) =>
                setSender({ ...sender, senderPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })
              }
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">
              Authorisation No. (GST No.) <span className="font-normal text-ink/40">(optional)</span>
            </label>
            <input
              type="text"
              value={sender.senderAuthNo}
              onChange={(e) => setSender({ ...sender, senderAuthNo: e.target.value.toUpperCase() })}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Manifest Document No.</label>
            <input
              type="text"
              required
              value={sender.manifestDocNo}
              onChange={(e) => setSender({ ...sender, manifestDocNo: e.target.value })}
              className={inputClasses}
            />
          </div>
        </div>
      </section>

      {/* Transport */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">Transport</h3>
        <div className="mb-4 inline-flex rounded-full border border-forest/15 p-1">
          {(["self", "third-party"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTransportMode(mode)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                transportMode === mode ? "bg-forest text-offwhite" : "text-ink/60 hover:text-ink"
              }`}
            >
              {mode === "self" ? "Self" : "Third-party"}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {transportMode === "third-party" && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Transporter Name</label>
                <input
                  type="text"
                  required
                  value={transporterName}
                  onChange={(e) => setTransporterName(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  Reg. No. / GST-PAN
                </label>
                <input
                  type="text"
                  required
                  value={transporterRegNo}
                  onChange={(e) => setTransporterRegNo(e.target.value.toUpperCase())}
                  className={inputClasses}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-ink">Transporter Address</label>
                <input
                  type="text"
                  required
                  value={transporterAddress}
                  onChange={(e) => setTransporterAddress(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Transporter Phone</label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  value={transporterPhone}
                  onChange={(e) => setTransporterPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className={inputClasses}
                />
              </div>
            </>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Vehicle Number</label>
            <input
              type="text"
              required
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">Type of Vehicle</label>
            <select
              required
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className={inputClasses}
            >
              <option value="">Select a vehicle type</option>
              {VEHICLE_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Items */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">Items</h3>
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <ItemRow
              key={item.key}
              item={item}
              index={index}
              onChange={(next) => updateItem(index, next)}
              onRemove={() => removeItem(index)}
              canRemove={items.length > 1}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyItem()])}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-brass"
        >
          <Plus size={15} /> Add another item
        </button>
      </section>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <div className="flex items-center justify-between border-t border-forest/10 pt-5">
        <p className="text-xs text-ink/40">Submitted by {submittedBy}</p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-offwhite transition-colors hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Submitting...
            </>
          ) : editingId ? (
            "Save Changes"
          ) : (
            "Submit Form-6"
          )}
        </button>
      </div>
    </form>
  );
}
