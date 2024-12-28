import * as React from "react";

interface InviteEmailTemplateProps {
  documentLink: string;
  role: "viewer" | "editor";
}

export const InviteEmailTemplate: React.FC<
  Readonly<InviteEmailTemplateProps>
> = ({ documentLink, role }) => (
  <div
    style={{
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: "40px 20px",
      background: "#f9f9f9",
      borderRadius: "8px",
      maxWidth: "600px",
      margin: "0 auto",
    }}
  >
    <h1
      style={{
        color: "#333",
        fontSize: "24px",
        marginBottom: "20px",
        fontWeight: 600,
      }}
    >
      Hi, there!
    </h1>
    <p
      style={{
        color: "#666",
        fontSize: "16px",
        lineHeight: 1.5,
        marginBottom: "32px",
      }}
    >
      You have been invited as a {role} on a document. Click the link below to
      access the document.
    </p>
    <a
      href={documentLink}
      style={{
        display: "inline-block",
        padding: "12px 24px",
        background: "#0070f3",
        color: "#fff",
        textDecoration: "none",
        borderRadius: "6px",
        fontWeight: 500,
        fontSize: "16px",
      }}
    >
      Access Document
    </a>
  </div>
);
