import { briefDownloadUrl } from "../api/client";

export function BriefExportButton({ documentId }: { documentId: string }) {
  return (
    <a
      href={briefDownloadUrl(documentId)}
      className="focus-ring inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
      download
    >
      Prepare brief for my lawyer (PDF)
    </a>
  );
}
