import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../api/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';

type MessageListItem = {
  id: number;
  user_response: 'pending' | 'accepted' | 'rejected' | string;
  reward_given: boolean;
};

type MessageDetail = {
  id: number;
  submitted_link: string;
};

function pill(text: string, variant: 'yellow' | 'green' | 'red' | 'blue' | 'gray' = 'gray') {
  const cls =
    variant === 'yellow'
      ? 'bg-yellow-500/15 text-yellow-300 border-yellow-400/30'
      : variant === 'green'
      ? 'bg-green-500/15 text-green-300 border-green-400/30'
      : variant === 'red'
      ? 'bg-red-500/15 text-red-300 border-red-400/30'
      : variant === 'blue'
      ? 'bg-blue-500/15 text-blue-200 border-blue-400/30'
      : 'bg-white/10 text-blue-100 border-white/20';

  return <span className={`inline-flex px-3 py-1 rounded-full text-xs border ${cls}`}>{text}</span>;
}

function responseVariant(user_response: string) {
  const s = String(user_response || '').toLowerCase();
  if (s === 'pending') return 'yellow' as const;
  if (s === 'accepted') return 'blue' as const;
  if (s === 'rejected') return 'red' as const;
  return 'gray' as const;
}

export function MessagesPage() {
  const [items, setItems] = useState<MessageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  // dialog
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MessageListItem | null>(null);
  const [detail, setDetail] = useState<MessageDetail | null>(null);

  // proof link editing
  const [submittedLink, setSubmittedLink] = useState('');
  const [acting, setActing] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await api.get('/customer/messages/');
      const list: MessageListItem[] = res.data?.data ?? [];
      const normalized = Array.isArray(list) ? list : [];

      normalized.sort((a, b) => b.id - a.id);

      setItems(normalized);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to load messages';
      setErrorMsg(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id: number) => {
    try {
      const res = await api.get(`/customer/messages/${id}/`);
      const d: MessageDetail | undefined = res.data?.data;
      if (!d) {
        setDetail(null);
        setSubmittedLink('');
        return;
      }
      setDetail(d);
      setSubmittedLink(d.submitted_link ?? '');
    } catch {
      setDetail(null);
      setSubmittedLink('');
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((m) => {
      const s = String(m.user_response || '').toLowerCase();
      const matchesFilter = filter === 'all' ? true : s === filter;
      const matchesQuery = !q ? true : String(m.id).includes(q) || s.includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [items, query, filter]);

  const openItem = async (m: MessageListItem) => {
    setSelected(m);
    setDetail(null);
    setSubmittedLink('');
    setOpen(true);
    await fetchDetail(m.id);
  };

  const refreshSelectedInList = (id: number, patch: Partial<MessageListItem>) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const accept = async () => {
    if (!selected) return;
    setActing(true);
    try {
      const res = await api.post(`/customer/messages/${selected.id}/accept/`);
      const updated: { id: number; user_response: string } | undefined = res.data?.data;

      toast.success('Accepted');

      const newResp = updated?.user_response ?? 'accepted';
      refreshSelectedInList(selected.id, { user_response: newResp });
      setSelected((prev) => (prev ? { ...prev, user_response: newResp } : prev));

      await fetchDetail(selected.id);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to accept';
      toast.error(String(msg));
    } finally {
      setActing(false);
    }
  };

  const saveProofLink = async () => {
    if (!selected) return;

    const link = submittedLink.trim();

    if (!link) {
      toast.error('Please paste a proof link');
      return;
    }

    try {
      new URL(link);
    } catch {
      toast.error('Invalid URL. Please provide a valid link (https://...)');
      return;
    }

    setActing(true);
    try {
      const res = await api.put(`/customer/messages/${selected.id}/`, {
        submitted_link: link,
      });

      const updated: MessageDetail | undefined = res.data?.data;
      toast.success('Proof link saved');

      if (updated) {
        setDetail(updated);
        setSubmittedLink(updated.submitted_link ?? link);
      } else {
        setSubmittedLink(link);
      }

      await fetchList();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to save proof link';
      toast.error(String(msg));
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <p className="text-white">Loading messages...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 space-y-4">
        <p className="text-white">Failed to load messages</p>
        <p className="text-blue-200 text-sm">{errorMsg}</p>
        <Button onClick={fetchList} className="bg-white/10 hover:bg-white/20">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-white mb-1">Messages</h2>
            <p className="text-blue-200 text-sm">
              Showing {filtered.length} of {items.length}
            </p>
          </div>

          <div className="flex gap-2">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  filter === k
                    ? 'bg-blue-500 text-white border-blue-400'
                    : 'bg-white/5 text-blue-100 border-white/10 hover:bg-white/10'
                }`}
              >
                {k === 'all' ? 'All' : k}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by id or status..."
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
            />
          </div>
          <Button onClick={fetchList} variant="outline" className="bg-white/10 border-white/20">
            Refresh
          </Button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-10 border border-white/20 text-center">
          <p className="text-white mb-2">No messages found</p>
          <p className="text-blue-200 text-sm">Try clearing search or changing filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => {
            const resp = String(m.user_response || '');
            return (
              <button
                key={m.id}
                onClick={() => openItem(m)}
                className="w-full text-left bg-white/10 hover:bg-white/15 transition-colors rounded-xl p-5 border border-white/20"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <p className="text-white text-base mb-1">
                      Message Task <span className="font-mono">#{m.id}</span>
                    </p>
                    <p className="text-blue-200 text-sm">
                      Status: <span className="text-white">{resp}</span>
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      {m.reward_given ? (
                        <span className="px-2 py-1 rounded bg-green-500/10 border border-green-400/20 text-green-200">
                          Reward Given
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-blue-200">
                          Reward Not Given
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    {pill(resp, responseVariant(resp))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Details dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 text-white border-white/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Message Task {selected ? <span className="font-mono">#{selected.id}</span> : ''}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-blue-200">
                    Status: <span className="text-white">{selected.user_response}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {pill(selected.user_response, responseVariant(selected.user_response))}
                    {selected.reward_given ? pill('Reward Given', 'green') : pill('No Reward Yet', 'gray')}
                  </div>
                </div>

                <div className="mt-3 text-blue-200 text-sm">
                  Proof Link:
                  <div className="mt-2 bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-white font-mono text-xs break-all">
                      {detail?.submitted_link ? detail.submitted_link : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
                <p className="text-blue-200 text-sm">
                  If you accept this task, you can submit proof as a link (e.g., Drive/Dropbox URL).
                </p>

                {(String(selected.user_response).toLowerCase() === 'accepted') && (
                  <div className="space-y-2">
                    <label className="text-blue-200 text-sm block">Submitted Link</label>
                    <Input
                      value={submittedLink}
                      onChange={(e) => setSubmittedLink(e.target.value)}
                      placeholder="https://example.com/proof"
                      className="bg-white/10 border-white/20 text-white font-mono"
                    />
                    <p className="text-blue-300 text-xs">
                      Paste a public link to your proof (screenshot uploaded somewhere).
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-transparent border-white/20"
              disabled={acting}
            >
              Close
            </Button>

            {selected && String(selected.user_response).toLowerCase() === 'pending' && (
              <Button
                onClick={accept}
                disabled={acting}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {acting ? 'Please wait...' : 'Accept'}
              </Button>
            )}

            {selected && String(selected.user_response).toLowerCase() === 'accepted' && (
              <Button
                onClick={saveProofLink}
                disabled={acting}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {acting ? 'Saving...' : 'Save Proof Link'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
