import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { adminMedia } from '../../services/admin';
import type { ApiAdminMedia } from '../../lib/api/types';
import { fromDateTimeInput } from '../lib/labels';

/**
 * One form field, described as data.
 *
 * The panel has six CRUD surfaces and they all need the same inputs, so a field is a *specification*
 * (`FieldSpec`) rather than JSX: `buildPayload` turns the collected values into the request body,
 * which is the one place a `number` becomes a number and an empty box becomes `null` — Laravel's
 * `date` and `integer` rules refuse an empty string, and "left blank" has to mean "no value".
 */

export type FormValue = string | number | boolean | string[] | null | undefined;

export type FormValues = Record<string, FormValue>;

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'datetime'
  | 'tags'
  | 'media';

export type FieldSpec = {
  name: string;
  label: string;
  type?: FieldType;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  /** Span both columns of the form grid. */
  full?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  /**
   * Whether the API accepts `null` for this column. When it does, leaving the box empty *clears*
   * the value; when it does not, the key is left out of the payload entirely, because a `null` a
   * validation rule cannot accept would turn "nothing changed" into a 422.
   */
  nullable?: boolean;
  /** What a *new* record starts with; an existing record's own value always wins. */
  defaultValue?: FormValue;
};

export type FieldErrors = Record<string, string>;

const fieldId = (name: string) => `admin-field-${name}`;

/** The values a blank form starts from. */
export const initialValues = (fields: FieldSpec[]): FormValues => {
  const values: FormValues = {};

  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      values[field.name] = field.defaultValue;
    } else if (field.type === 'checkbox') {
      values[field.name] = false;
    } else if (field.type === 'tags') {
      values[field.name] = [];
    } else {
      values[field.name] = '';
    }
  }

  return values;
};

/** The request body for one form: typed, trimmed, and `null` wherever the operator left it empty. */
export const buildPayload = (
  fields: FieldSpec[],
  values: FormValues,
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const value = values[field.name];

    const blank = value === '' || value === null || value === undefined;

    switch (field.type) {
      case 'checkbox':
        payload[field.name] = value === true;
        break;
      case 'number': {
        if (blank) {
          if (field.nullable) payload[field.name] = null;
          break;
        }
        payload[field.name] = Number(value);
        break;
      }
      case 'media':
        // Every media column in the API is nullable, so an empty picker clears the image.
        payload[field.name] = blank ? null : Number(value);
        break;
      case 'tags':
        payload[field.name] = Array.isArray(value) ? value : [];
        break;
      case 'select': {
        if (blank) {
          if (field.nullable) payload[field.name] = null;
          break;
        }
        payload[field.name] = String(value);
        break;
      }
      case 'datetime':
        // A date column is nullable wherever the API has one, so clearing the box clears the date.
        payload[field.name] = fromDateTimeInput(typeof value === 'string' ? value : '');
        break;
      default:
        payload[field.name] = typeof value === 'string' ? value.trim() : value;
    }
  }

  return payload;
};

const CONTROL =
  'w-full rounded-xl border border-line bg-white px-3.5 text-[13px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-teal-400 disabled:bg-cream/60';

/** The media library, as a picker: one select with a preview, so a cover is chosen, never typed. */
function MediaInput({
  field,
  value,
  onChange,
}: {
  field: FieldSpec;
  value: FormValue;
  onChange: (value: FormValue) => void;
}) {
  const [items, setItems] = useState<ApiAdminMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    adminMedia({ per_page: 100 })
      .then((page) => {
        if (active) setItems(page.items);
      })
      .catch(() => {
        /* the select simply stays empty; the field is optional */
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selected = items.find((item) => item.id === Number(value));

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-cream/60">
        {selected?.url ? (
          <img src={selected.url} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="h-4 w-4 text-muted" />
        )}
      </span>
      <select
        id={fieldId(field.name)}
        className={`${CONTROL} h-11`}
        value={value === null || value === undefined ? '' : String(value)}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{loading ? 'در حال دریافت…' : '— بدون تصویر —'}</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.alt_source ?? item.mime_type}
          </option>
        ))}
      </select>
    </div>
  );
}

/** A list of short values typed as one comma-separated line (`size: S, M, L`). */
function TagsInput({
  field,
  value,
  onChange,
}: {
  field: FieldSpec;
  value: FormValue;
  onChange: (value: FormValue) => void;
}) {
  const text = Array.isArray(value) ? value.join(', ') : '';

  return (
    <input
      id={fieldId(field.name)}
      type="text"
      // Uncontrolled on purpose: parsing on every keystroke would eat the comma the operator is
      // still typing, so the raw line stays in the DOM and only the parsed list travels up.
      defaultValue={text}
      placeholder={field.placeholder ?? 'با کاما جدا کنید'}
      className={`${CONTROL} h-11`}
      onChange={(event) =>
        onChange(
          event.target.value
            .split(',')
            .map((part) => part.trim())
            .filter((part) => part !== ''),
        )
      }
    />
  );
}

export function AdminField({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldSpec;
  value: FormValue;
  error?: string;
  onChange: (value: FormValue) => void;
}) {
  const describedBy = field.hint || error ? `${fieldId(field.name)}-note` : undefined;

  return (
    <div className={field.full ? 'sm:col-span-2' : ''}>
      {field.type === 'checkbox' ? (
        <label
          htmlFor={fieldId(field.name)}
          className="flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-white px-3.5"
        >
          <input
            id={fieldId(field.name)}
            type="checkbox"
            checked={value === true}
            onChange={(event) => onChange(event.target.checked)}
            className="h-4 w-4 accent-teal-700"
          />
          <span className="text-[13px] text-ink">{field.label}</span>
        </label>
      ) : (
        <>
          <label
            htmlFor={fieldId(field.name)}
            className="mb-1.5 block text-[12.5px] font-medium text-cocoa"
          >
            {field.label}
            {field.required ? <span className="text-wine"> *</span> : null}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              id={fieldId(field.name)}
              rows={field.rows ?? 4}
              value={typeof value === 'string' ? value : ''}
              placeholder={field.placeholder}
              aria-describedby={describedBy}
              onChange={(event) => onChange(event.target.value)}
              className={`${CONTROL} py-3 leading-7`}
            />
          ) : field.type === 'select' ? (
            <select
              id={fieldId(field.name)}
              value={value === null || value === undefined ? '' : String(value)}
              aria-describedby={describedBy}
              onChange={(event) => onChange(event.target.value)}
              className={`${CONTROL} h-11`}
            >
              <option value="">—</option>
              {(field.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === 'media' ? (
            <MediaInput field={field} value={value} onChange={onChange} />
          ) : field.type === 'tags' ? (
            <TagsInput field={field} value={value} onChange={onChange} />
          ) : (
            <input
              id={fieldId(field.name)}
              type={
                field.type === 'number'
                  ? 'number'
                  : field.type === 'datetime'
                    ? 'datetime-local'
                    : 'text'
              }
              value={value === null || value === undefined ? '' : String(value)}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              aria-describedby={describedBy}
              onChange={(event) => onChange(event.target.value)}
              className={`${CONTROL} h-11`}
            />
          )}
        </>
      )}

      {error ? (
        <p id={describedBy} className="mt-1.5 text-[12px] text-wine">
          {error}
        </p>
      ) : field.hint ? (
        <p id={describedBy} className="mt-1.5 text-[12px] text-muted">
          {field.hint}
        </p>
      ) : null}
    </div>
  );
}
