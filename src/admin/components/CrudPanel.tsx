import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { ApiError, type Query, type Page } from '../../lib/api/client';
import type { AdminResult } from '../../services/admin';
import { SectionError, SectionLoading } from '../../components/ui/SectionState';
import EmptyState from '../../components/ui/EmptyState';
import DataTable, { type Column } from './DataTable';
import Pagination from './Pagination';
import Modal from './Modal';
import {
  AdminField,
  buildPayload,
  initialValues,
  type FieldErrors,
  type FieldSpec,
  type FormValues,
} from './Field';

export type FilterSpec = {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
};

type Props<T> = {
  listTitle: string;
  description: string;
  /** The panel's search box is the API's `q` — an escaped LIKE over the fields the list searches. */
  searchPlaceholder: string;
  addLabel: string;
  itemLabel: string;
  columns: Column<T>[];
  /** The form fields. Empty means this surface has no inline form (it edits on its own page). */
  fields: FieldSpec[];
  toForm?: (row: T) => FormValues;
  idOf: (row: T) => number;
  labelOf: (row: T) => string;
  list: (query: Query) => Promise<Page<T>>;
  create?: (body: Record<string, unknown>) => Promise<AdminResult<unknown>>;
  update?: (id: number, body: Record<string, unknown>) => Promise<AdminResult<unknown>>;
  remove?: (id: number) => Promise<AdminResult<unknown>>;
  /** Where the pencil goes instead of opening a form (a surface with its own full page). */
  editHref?: (row: T) => string;
  /** Extra per-row controls, appended after the standard ones. Receives the list's reload. */
  rowActions?: (row: T, reload: () => void) => ReactNode;
  /** A last look at the body before it is sent, for a rule the fields cannot express. */
  prepare?: (payload: Record<string, unknown>) => Record<string, unknown>;
  /** A control in the header beside «add», for a surface whose create form is a page of its own. */
  headerAction?: ReactNode;
  filters?: FilterSpec[];
  perPage?: number;
  canWrite?: boolean;
};

const ICON_BUTTON =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-muted transition-colors hover:border-teal-300 hover:text-teal-700';

/**
 * One list surface, described instead of re-implemented.
 *
 * Six admin screens are "search, filter, list, edit in a dialog, delete with a confirmation", so the
 * behaviour — debounced search, paging, the API's own 422 field errors landing under the right
 * input, a confirmation that names the row it is about to remove — lives here once and each screen
 * supplies only its columns and its fields.
 *
 * `canWrite` is a rendering decision, never a permission: the API checks the named permission on
 * every route and answers 403 regardless of what the panel chose to draw.
 */
export default function CrudPanel<T>({
  listTitle,
  description,
  searchPlaceholder,
  addLabel,
  itemLabel,
  columns,
  fields,
  toForm,
  idOf,
  labelOf,
  list,
  create,
  update,
  remove,
  editHref,
  rowActions,
  prepare,
  headerAction,
  filters,
  perPage = 20,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}: Props<T>) {
  const [term, setTerm] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((filters ?? []).map((filter) => [filter.name, ''])),
  );

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // Typing must not fire a request per keystroke; 350ms is short enough to feel immediate.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQ(term.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [term]);

  const filterKey = JSON.stringify(filterValues);

  const query = useMemo<Query>(
    () => ({ q: q === '' ? undefined : q, page, per_page: perPage, ...filterValues }),
    // `filterKey` is the stable form of `filterValues`; the object identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, page, perPage, filterKey],
  );

  const state = useAsync<Page<T>>(() => list(query), [q, page, filterKey]);

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    setValues(initialValues(fields));
    setErrors({});
  };

  const openEdit = (row: T) => {
    setCreating(false);
    setEditing(row);
    setValues(toForm ? toForm(row) : initialValues(fields));
    setErrors({});
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
    setErrors({});
  };

  /** A refused write: field errors land on their inputs, everything else is one banner. */
  const handleFailure = (error: unknown) => {
    if (error instanceof ApiError && Object.keys(error.errors).length > 0) {
      setErrors(
        Object.fromEntries(
          Object.entries(error.errors).map(([field, messages]) => [field, messages[0]]),
        ),
      );
      setNotice({ ok: false, text: 'برخی فیلدها درست نیستند.' });
      return;
    }

    setNotice({
      ok: false,
      text: error instanceof ApiError ? error.message : 'ذخیره نشد؛ دوباره تلاش کنید.',
    });
  };

  const submit = async () => {
    const built = buildPayload(fields, values);
    const payload = prepare ? prepare(built) : built;
    setBusy(true);
    setErrors({});

    try {
      const result = editing
        ? await update?.(idOf(editing), payload)
        : await create?.(payload);

      setNotice({ ok: true, text: result?.message ?? 'ذخیره شد.' });
      closeForm();
      state.reload();
    } catch (error) {
      handleFailure(error);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;

    setBusy(true);

    try {
      const result = await remove?.(idOf(deleting));
      setNotice({ ok: true, text: result?.message ?? 'حذف شد.' });
      setDeleting(null);
      state.reload();
    } catch (error) {
      setDeleting(null);
      handleFailure(error);
    } finally {
      setBusy(false);
    }
  };

  const rows = state.data?.items ?? [];
  // What may be drawn: the permission the caller passed *and* something to actually run.
  const mayCreate = canCreate && Boolean(create) && fields.length > 0;
  const mayUpdate = canUpdate && (Boolean(update) || Boolean(editHref));
  const mayDelete = canDelete && Boolean(remove);

  const withActions: Column<T>[] = [
    ...columns,
    {
      key: '__actions',
      header: '',
      className: 'w-32',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {mayUpdate ? (
            editHref ? (
              <Link to={editHref(row)} className={ICON_BUTTON} aria-label="ویرایش">
                <Pencil className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openEdit(row)}
                className={ICON_BUTTON}
                aria-label="ویرایش"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )
          ) : null}

          {rowActions ? rowActions(row, state.reload) : null}

          {mayDelete ? (
            <button
              type="button"
              onClick={() => setDeleting(row)}
              className={`${ICON_BUTTON} hover:border-wine/40 hover:text-wine`}
              aria-label="حذف"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink sm:text-2xl">{listTitle}</h1>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-muted">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {headerAction}
          {mayCreate ? (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-800 px-4 text-[13px] font-medium text-white shadow-soft transition-colors hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              {addLabel}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute inset-y-0 end-3 my-auto h-4 w-4 text-muted" />
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-11 w-full rounded-xl border border-line bg-white pe-10 ps-3.5 text-[13px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-teal-400"
          />
        </div>

        {(filters ?? []).map((filter) => (
          <select
            key={filter.name}
            aria-label={filter.label}
            value={filterValues[filter.name] ?? ''}
            onChange={(event) => {
              setFilterValues((current) => ({ ...current, [filter.name]: event.target.value }));
              setPage(1);
            }}
            className="h-11 rounded-xl border border-line bg-white px-3 text-[13px] text-ink outline-none transition-colors focus:border-teal-400"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {notice ? (
        <p
          role="status"
          className={`mb-4 rounded-xl border px-4 py-2.5 text-[12.5px] ${
            notice.ok
              ? 'border-teal-200 bg-teal-50 text-teal-900'
              : 'border-wine/25 bg-wine/5 text-wine'
          }`}
        >
          {notice.text}
        </p>
      ) : null}

      {state.loading && !state.data ? (
        <SectionLoading label="در حال دریافت…" />
      ) : state.error ? (
        <SectionError error={state.error} onRetry={state.reload} />
      ) : (
        <>
          <DataTable
            columns={withActions}
            rows={rows}
            rowKey={(row) => idOf(row)}
            empty={
              <EmptyState
                icon={<Search className="h-5 w-5" />}
                title="چیزی پیدا نشد"
                text="با این جستوجو یا فیلتر موردی نیست."
              />
            }
          />
          <Pagination
            page={state.data?.page ?? 1}
            totalPages={state.data?.totalPages ?? 1}
            total={state.data?.total ?? rows.length}
            itemLabel={itemLabel}
            onChange={setPage}
          />
        </>
      )}

      <Modal
        open={creating || editing !== null}
        title={editing ? `ویرایش ${labelOf(editing)}` : addLabel}
        onClose={closeForm}
        size="wide"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <AdminField
                key={field.name}
                field={field}
                value={values[field.name]}
                error={errors[field.name]}
                onChange={(value) =>
                  setValues((current) => ({ ...current, [field.name]: value }))
                }
              />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="inline-flex h-11 items-center rounded-xl border border-line bg-white px-4 text-[13px] font-medium text-ink transition-colors hover:border-teal-300"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 items-center rounded-xl bg-teal-800 px-5 text-[13px] font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
            >
              {busy ? 'در حال ذخیره…' : 'ذخیره'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleting !== null}
        title="حذف"
        onClose={() => setDeleting(null)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="inline-flex h-11 items-center rounded-xl border border-line bg-white px-4 text-[13px] font-medium text-ink transition-colors hover:border-teal-300"
            >
              انصراف
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void confirmDelete()}
              className="inline-flex h-11 items-center rounded-xl bg-wine px-5 text-[13px] font-medium text-white transition-colors hover:bg-wine-dark disabled:opacity-50"
            >
              {busy ? 'در حال حذف…' : 'حذف کن'}
            </button>
          </>
        }
      >
        <p className="text-[13px] leading-7 text-muted">
          «{deleting ? labelOf(deleting) : ''}» حذف شود؟ این کار برگشتپذیر نیست.
        </p>
      </Modal>
    </div>
  );
}
