"use client";

import { useState, useTransition } from "react";
import { saveSiteContent, saveWing } from "@/lib/admin-actions";
import {
  CONTACT_ROLES,
  type BCGroup,
  type ContactCard,
  type MeetTime,
  type SiteContent,
  type ValueItem,
  type Wing,
  type WingSubgroup,
} from "@/lib/types";

export function SiteContentManager({
  content,
  wings,
}: {
  content: SiteContent;
  wings: Wing[];
}) {
  const [site, setSite] = useState<SiteContent>(content);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) =>
    setSite((s) => ({ ...s, [key]: value }));

  function handleSave() {
    startTransition(async () => {
      const result = await saveSiteContent(site);
      setMessage(result.message);
    });
  }

  return (
    <div className="space-y-10">
      <Section
        title="Homepage top"
        hint="The title and subtitle shown when there are no featured posts, and the Who we are introduction."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Hero title</label>
            <input className="field" value={site.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
          </div>
          <div>
            <label className="label">Hero subtitle</label>
            <input className="field" value={site.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Who we are (introduction)</label>
          <textarea
            className="field"
            rows={4}
            value={site.intro}
            onChange={(e) => set("intro", e.target.value)}
          />
        </div>
      </Section>

      <Section title="Address & contact details">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Centre address</label>
            <input
              className="field"
              value={site.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Contact email</label>
            <input
              className="field"
              type="email"
              value={site.contactEmail}
              onChange={(e) => set("contactEmail", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Instagram username</label>
            <div className="flex items-center gap-2">
              <span className="text-ink-faint">@</span>
              <input
                className="field"
                value={site.instagramHandle}
                onChange={(e) => set("instagramHandle", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">Google Maps embed URL (optional)</label>
            <input
              className="field"
              placeholder="https://www.google.com/maps/embed?..."
              value={site.mapEmbedUrl}
              onChange={(e) => set("mapEmbedUrl", e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Parking and arrival notes</label>
          <textarea
            className="field"
            rows={2}
            value={site.parkingInfo}
            onChange={(e) => set("parkingInfo", e.target.value)}
          />
        </div>
      </Section>

      <Section
        title="When we meet"
        hint="The weekly schedule shown on the homepage and contact page."
      >
        <MeetTimesEditor times={site.whenMeet} onChange={(whenMeet) => set("whenMeet", whenMeet)} />
      </Section>

      <Section
        title="Values we practise"
        hint="The five values and their one-line descriptions."
      >
        <div className="mb-4">
          <label className="label">Section introduction</label>
          <textarea
            className="field"
            rows={2}
            value={site.valuesIntro}
            onChange={(e) => set("valuesIntro", e.target.value)}
          />
        </div>
        <ValuesEditor values={site.values} onChange={(values) => set("values", values)} />
      </Section>

      <Section
        title="Who is Sri Sathya Sai Baba?"
        hint="Separate paragraphs with a blank line."
      >
        <input
          className="field mb-3"
          value={site.babaTitle}
          onChange={(e) => set("babaTitle", e.target.value)}
          aria-label="Section title"
        />
        <textarea
          className="field"
          rows={6}
          value={site.babaBody}
          onChange={(e) => set("babaBody", e.target.value)}
        />
      </Section>

      <Section title="Sri Sathya Sai International Organization">
        <input
          className="field mb-3"
          value={site.sssioTitle}
          onChange={(e) => set("sssioTitle", e.target.value)}
          aria-label="Section title"
        />
        <textarea
          className="field"
          rows={6}
          value={site.sssioBody}
          onChange={(e) => set("sssioBody", e.target.value)}
        />
      </Section>

      <Section
        title="Contact cards"
        hint="Cards appear on the homepage. Turn visibility off to hide a card without deleting it."
      >
        <ContactsEditor
          contacts={site.contacts}
          onChange={(contacts) => set("contacts", contacts)}
        />
      </Section>

      <Section
        title="Other Sai centres in BC"
        hint="Nearby centres and groups, shown at the bottom of the homepage."
      >
        <GroupsEditor
          groups={site.bcGroups}
          onChange={(bcGroups) => set("bcGroups", bcGroups)}
        />
      </Section>

      <div className="sticky bottom-4 flex flex-wrap items-center gap-4 rounded-lg border border-line bg-white-warm p-4 shadow-soft">
        <button onClick={handleSave} disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Save site content"}
        </button>
        {message && <p className="text-[0.875rem] text-ink-soft">{message}</p>}
      </div>

      <Section
        title="Wings"
        hint="Each wing card on the homepage and the Wings page. Saved one wing at a time."
      >
        <div className="space-y-6">
          {wings.map((wing) => (
            <WingEditor key={wing.slug} wing={wing} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-7 sm:p-8">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      {hint && <p className="mt-1 text-[0.85rem] text-ink-soft">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ContactsEditor({
  contacts,
  onChange,
}: {
  contacts: ContactCard[];
  onChange: (c: ContactCard[]) => void;
}) {
  const update = (id: string, patch: Partial<ContactCard>) =>
    onChange(contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const add = () =>
    onChange([
      ...contacts,
      {
        id: `c-${Date.now()}`,
        name: "",
        role: CONTACT_ROLES[contacts.length % CONTACT_ROLES.length],
        email: "",
        phone: "",
        visible: true,
      },
    ]);

  return (
    <div className="space-y-4">
      {contacts.length === 0 && (
        <p className="rounded border border-dashed border-line p-4 text-[0.9rem] text-ink-soft">
          No contact cards yet. Add one for each executive and coordinator role.
        </p>
      )}
      {contacts.map((c) => (
        <div key={c.id} className="grid gap-3 rounded-lg border border-line bg-sand/30 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]">
          <input
            className="field"
            placeholder="Name"
            aria-label="Name"
            value={c.name}
            onChange={(e) => update(c.id, { name: e.target.value })}
          />
          <select
            className="field"
            aria-label="Role"
            value={c.role}
            onChange={(e) => update(c.id, { role: e.target.value })}
          >
            {CONTACT_ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
            {!CONTACT_ROLES.includes(c.role) && <option>{c.role}</option>}
          </select>
          <input
            className="field"
            type="email"
            placeholder="Email"
            aria-label="Email"
            value={c.email}
            onChange={(e) => update(c.id, { email: e.target.value })}
          />
          <input
            className="field"
            placeholder="Phone (optional)"
            aria-label="Phone"
            value={c.phone}
            onChange={(e) => update(c.id, { phone: e.target.value })}
          />
          <label className="flex items-center gap-2 text-[0.85rem] text-ink-soft">
            <input
              type="checkbox"
              checked={c.visible}
              onChange={(e) => update(c.id, { visible: e.target.checked })}
              className="accent-[var(--color-terra)]"
            />
            Visible
          </label>
          <button
            onClick={() => onChange(contacts.filter((x) => x.id !== c.id))}
            className="text-[0.85rem] text-ink-faint underline underline-offset-4 hover:text-terra-deep"
          >
            Remove
          </button>
        </div>
      ))}
      <button onClick={add} className="btn btn-quiet">
        + Add contact card
      </button>
    </div>
  );
}

function GroupsEditor({
  groups,
  onChange,
}: {
  groups: BCGroup[];
  onChange: (g: BCGroup[]) => void;
}) {
  const update = (id: string, patch: Partial<BCGroup>) =>
    onChange(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const add = () =>
    onChange([
      ...groups,
      { id: `g-${Date.now()}`, name: "", address: "", contact: "", meetingTime: "", link: "" },
    ]);

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.id} className="space-y-3 rounded-lg border border-line bg-sand/30 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="field"
              placeholder="Centre name"
              aria-label="Centre name"
              value={g.name}
              onChange={(e) => update(g.id, { name: e.target.value })}
            />
            <input
              className="field"
              placeholder="Address"
              aria-label="Address"
              value={g.address}
              onChange={(e) => update(g.id, { address: e.target.value })}
            />
            <input
              className="field"
              placeholder="Meeting time (e.g. Sundays 5 pm)"
              aria-label="Meeting time"
              value={g.meetingTime}
              onChange={(e) => update(g.id, { meetingTime: e.target.value })}
            />
            <input
              className="field"
              placeholder="Contact (email or phone)"
              aria-label="Contact"
              value={g.contact}
              onChange={(e) => update(g.id, { contact: e.target.value })}
            />
            <input
              className="field sm:col-span-2"
              placeholder="Website or social link (optional)"
              aria-label="Link"
              value={g.link}
              onChange={(e) => update(g.id, { link: e.target.value })}
            />
          </div>
          <button
            onClick={() => onChange(groups.filter((x) => x.id !== g.id))}
            className="text-[0.85rem] text-ink-faint underline underline-offset-4 hover:text-terra-deep"
          >
            Remove this centre
          </button>
        </div>
      ))}
      <button onClick={add} className="btn btn-quiet">
        + Add a centre
      </button>
    </div>
  );
}

function WingEditor({ wing }: { wing: Wing }) {
  const [draft, setDraft] = useState(wing);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await saveWing(draft);
      setMessage(result.message);
    });
  }

  return (
    <div className="rounded-lg border border-line bg-sand/30 p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Wing name</label>
          <input
            className="field"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Short tagline</label>
          <input
            className="field"
            value={draft.tagline}
            onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea
            className="field"
            rows={4}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Activities (one per line)</label>
          <textarea
            className="field"
            rows={3}
            value={draft.activities.join("\n")}
            onChange={(e) => setDraft({ ...draft, activities: e.target.value.split("\n") })}
            onBlur={(e) =>
              setDraft({
                ...draft,
                activities: e.target.value.split("\n").map((a) => a.trim()).filter(Boolean),
              })
            }
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Image URL (optional)</label>
          <input
            className="field"
            placeholder="A photo for this wing's section"
            value={draft.imageUrl ?? ""}
            onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value || null })}
          />
        </div>
      </div>

      <div className="mt-5">
        <p className="label">Subgroups & pages</p>
        <p className="mb-3 text-[0.8rem] text-ink-faint">
          Coordinators can add sections to their wing page here: a subgroup, a
          program, or anything else, with optional links to a calendar, a form,
          or resources.
        </p>
        <SubgroupsEditor
          subgroups={draft.subgroups}
          onChange={(subgroups) => setDraft({ ...draft, subgroups })}
        />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button onClick={handleSave} disabled={pending} className="btn btn-quiet">
          Save {draft.name}
        </button>
        {message && <p className="text-[0.85rem] text-ink-soft">{message}</p>}
      </div>
    </div>
  );
}

function MeetTimesEditor({
  times,
  onChange,
}: {
  times: MeetTime[];
  onChange: (t: MeetTime[]) => void;
}) {
  const update = (i: number, patch: Partial<MeetTime>) =>
    onChange(times.map((t, j) => (j === i ? { ...t, ...patch } : t)));

  return (
    <div className="space-y-3">
      {times.map((t, i) => (
        <div key={i} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            className="field"
            placeholder="Time (e.g. Sundays, 5:00 pm)"
            aria-label="Time"
            value={t.time}
            onChange={(e) => update(i, { time: e.target.value })}
          />
          <input
            className="field"
            placeholder="Program (e.g. Bhajans and satsang)"
            aria-label="Program"
            value={t.label}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <button
            onClick={() => onChange(times.filter((_, j) => j !== i))}
            className="text-[0.85rem] text-ink-faint underline underline-offset-4 hover:text-terra-deep"
          >
            Remove
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...times, { label: "", time: "" }])} className="btn btn-quiet">
        + Add a meeting time
      </button>
    </div>
  );
}

function ValuesEditor({
  values,
  onChange,
}: {
  values: ValueItem[];
  onChange: (v: ValueItem[]) => void;
}) {
  const update = (i: number, patch: Partial<ValueItem>) =>
    onChange(values.map((v, j) => (j === i ? { ...v, ...patch } : v)));

  return (
    <div className="space-y-3">
      {values.map((v, i) => (
        <div key={i} className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr]">
          <input
            className="field"
            placeholder="Value (e.g. Love)"
            aria-label="Value name"
            value={v.name}
            onChange={(e) => update(i, { name: e.target.value })}
          />
          <input
            className="field"
            placeholder="Sanskrit (e.g. Prema)"
            aria-label="Sanskrit name"
            value={v.sanskrit}
            onChange={(e) => update(i, { sanskrit: e.target.value })}
          />
          <input
            className="field"
            placeholder="One-line description"
            aria-label="Description"
            value={v.line}
            onChange={(e) => update(i, { line: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

function SubgroupsEditor({
  subgroups,
  onChange,
}: {
  subgroups: WingSubgroup[];
  onChange: (s: WingSubgroup[]) => void;
}) {
  const update = (id: string, patch: Partial<WingSubgroup>) =>
    onChange(subgroups.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-3">
      {subgroups.map((sg) => (
        <div key={sg.id} className="space-y-2 rounded-lg border border-line bg-white-warm p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className="field"
              placeholder="Subgroup title (e.g. SSE Group 3)"
              aria-label="Subgroup title"
              value={sg.title}
              onChange={(e) => update(sg.id, { title: e.target.value })}
            />
            <input
              className="field"
              placeholder="Link (optional): label | url"
              aria-label="Link"
              value={sg.links[0] ? `${sg.links[0].label} | ${sg.links[0].url}` : ""}
              onChange={(e) => {
                const [label, url] = e.target.value.split("|").map((x) => x.trim());
                update(sg.id, { links: label && url ? [{ label, url }] : [] });
              }}
            />
          </div>
          <textarea
            className="field"
            rows={2}
            placeholder="Short description"
            aria-label="Subgroup description"
            value={sg.description}
            onChange={(e) => update(sg.id, { description: e.target.value })}
          />
          <button
            onClick={() => onChange(subgroups.filter((s) => s.id !== sg.id))}
            className="text-[0.85rem] text-ink-faint underline underline-offset-4 hover:text-terra-deep"
          >
            Remove subgroup
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          onChange([
            ...subgroups,
            { id: `sg-${Date.now()}`, title: "", description: "", links: [] },
          ])
        }
        className="btn btn-quiet"
      >
        + Add a subgroup
      </button>
    </div>
  );
}
