import { useMemo, useState } from "react";
import { useCustomerKyc } from "@/hooks/useCustomerKyc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
}

function toMediaUrlSafe(pathOrUrl?: string | null) {
  const v = String(pathOrUrl ?? "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  const origin = window.location.origin;
  const p = v.startsWith("/") ? v : `/${v}`;
  return `${origin}${p}`;
}

export function CustomerKycPanel() {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const { query, submit } = useCustomerKyc();
  const kyc = query.data;

  const [notes, setNotes] = useState("");
  const [passportFile, setPassportFile] = useState<File | null>(null);

  const state = useMemo(() => {
    if (!kyc) return "NOT_SUBMITTED" as const;
    return kyc.status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED";
  }, [kyc]);

  const canSubmit = state === "NOT_SUBMITTED" || state === "REJECTED";
  const readOnly = state === "PENDING" || state === "APPROVED";

  const fileRequired = state === "NOT_SUBMITTED";
  const canSubmitNow = canSubmit && (!fileRequired || !!passportFile);

  const onSubmit = () => {
    if (readOnly) return;

    if (fileRequired && !passportFile) {
      alert(t("kyc.alert.passportRequired"));
      return;
    }

    submit.mutate({
      passportImage: passportFile,
      notes: notes.trim() ? notes.trim() : undefined,
     
    });
  };

  const existingImg = useMemo(() => {
    return kyc?.passport_image ? `https://investpro-company.com${kyc.passport_image}` : "";
  }, [kyc?.passport_image]);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-4 text-white"
    >
      <div>
        <h2 className="text-white mb-1">{t("kyc.title")}</h2>
        <p className="text-blue-200 text-sm">{t("kyc.subtitle")}</p>
      </div>

      {query.isLoading && <p className="text-blue-200">{t("kyc.loading")}</p>}
      {query.error && (
        <p className="text-red-400">
          {(query.error as any)?.message || t("kyc.loadError")}
        </p>
      )}

      {!query.isLoading && !query.error && (
        <>
          {/* Status Card */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div
              className={`flex flex-col ${isRTL ? "md:flex-row-reverse" : "md:flex-row"} md:items-center md:justify-between gap-3`}
            >
              <div>
                <p className="text-blue-200 text-sm">{t("kyc.currentStatus")}</p>
                <p className="text-white text-lg">
                  {state === "NOT_SUBMITTED"
                    ? t("kyc.status.notSubmitted")
                    : state === "PENDING"
                    ? t("kyc.status.pending")
                    : state === "APPROVED"
                    ? t("kyc.status.approved")
                    : state === "REJECTED"
                    ? t("kyc.status.rejected")
                    : kyc?.status}
                </p>
              </div>

              <div className="text-sm text-blue-200">
                <div>{t("kyc.submitted")}: {formatDate(kyc?.submitted_at)}</div>
                <div>{t("kyc.reviewed")}: {formatDate(kyc?.reviewed_at)}</div>
              </div>
            </div>

            {kyc?.notes && (
              <div className="mt-3 text-sm">
                <p className="text-blue-200">{t("kyc.notes")}</p>
                <p className="text-white/90 whitespace-pre-wrap">{kyc.notes}</p>
              </div>
            )}

            {state === "REJECTED" && (
              <div className="mt-3 text-sm text-red-300">
                {t("kyc.msg.rejected")}
              </div>
            )}

            {state === "PENDING" && (
              <div className="mt-3 text-sm text-yellow-300">
                {t("kyc.msg.pending")}
              </div>
            )}

            {state === "APPROVED" && (
              <div className="mt-3 text-sm text-green-300">
                {t("kyc.msg.approved")}
              </div>
            )}
          </div>

          {/* Upload + Notes */}
          <div className="space-y-3">
            <div>
              <label className="text-blue-200 text-sm block mb-2">
                {t("kyc.passportImage")}{" "}
                {fileRequired ? <span className="text-red-300">*</span> : null}{" "}
                {readOnly ? `(${t("kyc.disabledWhilePendingApproved")})` : ""}
              </label>

              <input
                id="passport-image"
                type="file"
                accept="image/*"
                disabled={readOnly || submit.isPending}
                onChange={(e) => setPassportFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label
                  htmlFor="passport-image"
                  className={[
                    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
                    "bg-white/10 hover:bg-white/15 border border-white/20 cursor-pointer select-none",
                    "transition-colors",
                    (readOnly || submit.isPending) ? "opacity-50 cursor-not-allowed hover:bg-white/10" : "",
                  ].join(" ")}
                >
                  {passportFile ? t("kyc.changeFile") : t("kyc.chooseFile")}
                </label>

                <div className="min-w-0 flex-1">
                  {passportFile ? (
                    <p className="text-blue-100 text-sm truncate">
                      {passportFile.name}
                    </p>
                  ) : (
                    <p className="text-blue-300 text-xs">
                      {t("kyc.noFileChosen")}
                    </p>
                  )}
                </div>

                {passportFile ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-transparent border-white/20"
                    onClick={() => setPassportFile(null)}
                    disabled={readOnly || submit.isPending}
                  >
                    {t("common.clear")}
                  </Button>
                ) : null}
              </div>

              {existingImg ? (
                <div className="mt-3 space-y-2">
                  <p className="text-blue-200 text-xs">{t("kyc.currentFile")}</p>

                  <a
                    href={existingImg}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block"
                    title={t("kyc.openFullImage")}
                  >
                    <img
  src={existingImg}
  alt="Passport"
  style={{
    width: "140px",
    height: "90px",
    objectFit: "cover",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
  }}
/>

                  </a>

                  <a
                    href={existingImg}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-300 text-xs underline hover:text-blue-200"
                  >
                    {t("kyc.openFullImage")}
                  </a>
                </div>
              ) : null}
            </div>

            <div>
              <label className="text-blue-200 text-sm block mb-1">
                {t("kyc.notesOptional")} {readOnly ? `(${t("kyc.readOnlyWhilePendingApproved")})` : ""}
              </label>

              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  canSubmit
                    ? t("kyc.notesPlaceholder")
                    : t("kyc.notesLockedPlaceholder")
                }
                className="bg-white/10 border-white/20 text-white min-h-[110px]"
                disabled={readOnly || submit.isPending}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onSubmit}
                className="bg-blue-500 hover:bg-blue-600"
                disabled={!canSubmitNow || submit.isPending}
              >
                {submit.isPending
                  ? t("common.submitting")
                  : state === "REJECTED"
                  ? t("kyc.resubmit")
                  : t("kyc.submit")}
              </Button>

              <Button
                variant="outline"
                className="bg-transparent border-white/20"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
              >
                {t("common.refresh")}
              </Button>
            </div>

            {submit.error && (
              <p className="text-red-400 text-sm">
                {(submit.error as any)?.message || t("kyc.submitError")}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
