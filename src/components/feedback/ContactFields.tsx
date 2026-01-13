"use client";

interface ContactFieldsProps {
  email: string;
  twitterHandle: string;
  onEmailChange: (value: string) => void;
  onTwitterChange: (value: string) => void;
  inputClassName: string;
  labelClassName: string;
}

export function ContactFields({
  email,
  twitterHandle,
  onEmailChange,
  onTwitterChange,
  inputClassName,
  labelClassName,
}: ContactFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="email" className={labelClassName}>
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="your@email.com"
          className={inputClassName}
        />
      </div>
      <div>
        <label htmlFor="twitter" className={labelClassName}>
          X/Twitter Handle (optional)
        </label>
        <input
          type="text"
          id="twitter"
          value={twitterHandle}
          onChange={(e) => onTwitterChange(e.target.value)}
          placeholder="@handle"
          className={inputClassName}
        />
      </div>
    </div>
  );
}
