import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

import { DataTable } from "@/components/ui/data-table";
import { Icons } from "@/components/shared/icons";
import EmailContentModal from "@/components/modals/email-content-modal";

type Emails = {
  id: string;
  tenant_id: string;
  apiKeyId: string;
  from: string;
  to: string;
  subject: string;
  status?: string;
  html_body?: string;
  text_body?: string;
  createdAt: string | Date;
};

interface EmailTableProps {
  initialEmailList: Emails[];
  initialIsLoading: boolean;
  apiKeyMap?: Record<string, string>;
  onApiKeyClick?: (apiKeyId: string, apiKeyName: string) => void;
  activeFilterApiKey?: string;
  onClearFilter?: () => void;
  nextCursor?: string | null;
  onNextPage?: () => void;
  onPrevPage?: () => void;
  canGoPrev?: boolean;
}

const EmailTable: React.FC<EmailTableProps> = ({
  initialEmailList,
  initialIsLoading = false,
  apiKeyMap = {},
  onApiKeyClick,
  activeFilterApiKey,
  onClearFilter,
  nextCursor,
  onNextPage,
  onPrevPage,
  canGoPrev = false,
}) => {
  const [emails, setEmails] = useState<Emails[]>(initialEmailList);
  const [isLoading, setIsLoading] = useState<boolean>(initialIsLoading);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Emails | null>(null);

  useEffect(() => {
    setEmails(initialEmailList);
    setIsLoading(initialIsLoading);
  }, [initialEmailList, initialIsLoading]);

  const handleEmailClick = (email: Emails) => {
    setSelectedEmail(email);
    setIsModalOpen(true);
  };

  const columns = [
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => {
        const status = getValue() || "sent";
        const colors = {
          sent: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
          failed: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
          pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
        };
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colors[status] || colors.sent}`}>
            {status}
          </span>
        );
      },
    },
    {
      id: "from",
      header: "From",
      accessorKey: "from",
      cell: ({ getValue }) => (
        <span className="text-xs text-foreground">{getValue()}</span>
      ),
    },
    {
      id: "to",
      header: "To",
      accessorKey: "to",
      cell: ({ getValue }) => (
        <span className="text-xs text-foreground">{getValue()}</span>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      accessorKey: "subject",
      cell: ({ row }) => (
        <button
          onClick={() => handleEmailClick(row.original)}
          className="text-xs text-foreground font-medium hover:underline cursor-pointer"
        >
          {row.original.subject}
        </button>
      ),
    },
    {
      id: "apiKey",
      header: "API Key",
      accessorKey: "apiKeyId",
      cell: ({ getValue }) => {
        const apiKeyId = getValue();
        if (!apiKeyId) return <span className="text-xs text-muted-foreground">-</span>;
        if (apiKeyMap[apiKeyId]) {
          const isActiveFilter = activeFilterApiKey === apiKeyId;

          return (
            <div className="flex items-center">
              {isActiveFilter ? (
                <div className="group flex items-center gap-1.5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-300/80 text-xs font-medium shadow-md shadow-blue-500/20 dark:from-blue-900/60 dark:to-indigo-900/60 dark:text-blue-200 dark:border-blue-700/80">
                    {apiKeyMap[apiKeyId]}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearFilter?.();
                    }}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 hover:border-red-300 hover:text-red-700 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-800/60 dark:hover:text-red-300"
                    title="Clear filter"
                  >
                    <Icons.close className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onApiKeyClick?.(apiKeyId, apiKeyMap[apiKeyId])}
                  className="group inline-flex items-center px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/60 text-xs font-medium shadow-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:border-blue-300/80 hover:from-blue-100 hover:to-indigo-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 active:scale-[0.98] active:shadow-md transform hover:scale-[1.02] dark:from-blue-950/50 dark:to-indigo-950/50 dark:text-blue-300 dark:border-blue-800/60 dark:hover:border-blue-700/80 dark:hover:from-blue-900/60 dark:hover:to-indigo-900/60"
                  title={`Filter by ${apiKeyMap[apiKeyId]}`}
                >
                  <span className="transition-all duration-200">
                    {apiKeyMap[apiKeyId]}
                  </span>
                  <div className="ml-0 w-0 opacity-0 overflow-hidden group-hover:ml-1.5 group-hover:w-3 group-hover:opacity-100 transition-all duration-300 ease-out">
                    <svg className="w-3 h-3 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                </button>
              )}
            </div>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-background text-muted-foreground border border-border text-xs font-medium shadow-sm">
            Deleted
          </span>
        );
      },
    },
    {
      id: "sent",
      header: "Sent",
      accessorKey: "createdAt",
      cell: ({ getValue }) => {
        const value = getValue();
        const date = value instanceof Date ? value : new Date(value);
        return (
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(date, { addSuffix: true })}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={emails}
        isLoading={isLoading}
      />
      {/* Server-side Pagination Controls */}
      <div className="mt-4 flex items-center justify-end text-sm text-zinc-400">
        <div>
          <button
            onClick={onPrevPage}
            disabled={!canGoPrev}
            className="rounded border p-2 disabled:opacity-50"
          >
            <Icons.chevronLeft className="size-3 text-white" />
          </button>
          <button
            onClick={onNextPage}
            disabled={!nextCursor}
            className="ml-2 rounded border p-2 disabled:opacity-50"
          >
            <Icons.chevronRight className="size-3 text-white" />
          </button>
        </div>
      </div>
      <EmailContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        email={selectedEmail}
      />
    </>
  );
};

export default EmailTable;
