import React from 'react'
import useClipboard from 'react-use-clipboard'

export const CopyButton = (props) => {
  const [copied, setCopied] = useClipboard(props.value, {successDuration: 3000})

  return (
    <button type="button" className="copy-button" onClick={setCopied}>
      {copied ? (
        <svg
          role="img"
          aria-label="Copied!"
          className="icon icon-copy"
          viewBox="0 0 16 16"
          width={16}
          height={16}
        >
          <title>Copied!</title>
          <path
            fill="currentcolor"
            fillRule="evenodd"
            d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
          />
        </svg>
      ) : (
        <svg
          role="img"
          aria-label="Copy"
          className="icon icon-copy"
          viewBox="0 0 16 16"
          width={16}
          height={16}
        >
          <title>Copy</title>
          <path
            fill="currentcolor"
            fillRule="evenodd"
            d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"
          />
          <path
            fill="currentcolor"
            fillRule="evenodd"
            d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"
          />
        </svg>
      )}
    </button>
  )
}
