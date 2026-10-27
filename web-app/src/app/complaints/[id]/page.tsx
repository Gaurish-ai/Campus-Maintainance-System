"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import { Modal } from '@/components/ui/Modal';
import { PriorityLevel } from '@/lib/types';
import { ArrowLeft, CheckCircle2, AlertTriangle, Layers, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawReportId = (params?.id as string) || '';
  const reportId = decodeURIComponent(rawReportId);
  const { 
    currentUser,
    complaints, 
    incidents, 
    updateComplaint,
    deleteComplaint,
    assignTechnician,
    updateIncidentStatus,
    updateIncidentPriority
  } = useApp();

  const complaint = complaints.find(c => c.report_id === reportId || c.report_id === rawReportId);
  const parentIncident = incidents.find(i => 
    i.incident_id === complaint?.incident_id || 
    (complaint?.incident_id && i.incident_id.replace(/\//g, '-') === complaint.incident_id.replace(/\//g, '-'))
  );
  const relatedComplaints = parentIncident 
    ? complaints.filter(c => parentIncident.complaint_ids.includes(c.report_id) && c.report_id !== reportId)
    : [];

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editTitle, setEditTitle] = useState(complaint?.problem_type || '');
  const [editDescription, setEditDescription] = useState(complaint?.description || '');
  const [editLocation, setEditLocation] = useState(complaint?.location_id || '');
  const [editRoom, setEditRoom] = useState(complaint?.room_or_area || '');

  const [overridePriority, setOverridePriority] = useState<PriorityLevel>(complaint?.ground_truth_priority || 4);
  const [overrideReason, setOverrideReason] = useState('');
  const [selectedTech, setSelectedTech] = useState({ id: 'usr-tech-01', name: 'Ramesh Verma (HVAC Master)' });

  if (!complaint) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-10 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
        <h2 className="text-base font-bold text-white">Complaint Not Found</h2>
        <Link href="/complaints" className="text-xs text-blue-400 hover:underline">
          Back to Complaints
        </Link>
      </div>
    );
  }

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint.incident_id) return;
    assignTechnician(complaint.incident_id, selectedTech.id, selectedTech.name);
    setIsAssignModalOpen(false);
  };

  const handlePrioritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint.incident_id) return;
    updateIncidentPriority(complaint.incident_id, overridePriority, overrideReason);
    setIsPriorityModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateComplaint(reportId, {
      problem_type: editTitle,
      description: editDescription,
      location_id: editLocation,
      room_or_area: editRoom
    });
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    deleteComplaint(reportId);
    setIsDeleteModalOpen(false);
    router.push('/complaints');
  };

  const canEditOrDelete = currentUser.role === 'student' || currentUser.role === 'admin';
  const isAdmin = currentUser.role === 'admin';
  const isTechOrAdmin = currentUser.role === 'technician' || currentUser.role === 'admin';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2 border-b border-zinc-800 pb-4">
        <Link href="/complaints" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Complaints</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
              {complaint.report_id}
            </span>
            <PriorityBadge priority={complaint.ground_truth_priority} />
            <StatusBadge status={complaint.status} />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Student or Admin can edit */}
            {canEditOrDelete && (
              <button
                type="button"
                onClick={() => {
                  setEditTitle(complaint.problem_type);
                  setEditDescription(complaint.description);
                  setEditLocation(complaint.location_id);
                  setEditRoom(complaint.room_or_area || '');
                  setIsEditModalOpen(true);
                }}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Pencil className="w-3 h-3 text-blue-400" />
                <span>Edit</span>
              </button>
            )}

            {/* Student or Admin can delete */}
            {canEditOrDelete && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-2.5 py-1 rounded bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}

            {/* Admin can change priority */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsPriorityModalOpen(true)}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold"
              >
                Change Priority
              </button>
            )}

            {/* Admin or Tech assignment/resolve */}
            {isAdmin && !parentIncident?.assigned_technician_name ? (
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(true)}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Assign Tech
              </button>
            ) : (
              isTechOrAdmin && complaint.status !== 'COMPLETED' && (
                <button
                  type="button"
                  onClick={() => {
                    if (complaint.incident_id) {
                      updateIncidentStatus(complaint.incident_id, 'RESOLVED');
                    }
                  }}
                  className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolve</span>
                </button>
              )
            )}
          </div>
        </div>

        <h1 className="text-xl font-bold text-white pt-1">{complaint.problem_type}</h1>
        <p className="text-xs text-zinc-400 mt-1 italic">"{complaint.description}"</p>
      </div>

      {/* Progress Timeline */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="text-xs font-semibold text-zinc-400 mb-2">Status Timeline</h2>
        <StatusTimeline currentStatus={complaint.status} />
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Report Details</h3>

          <p className="p-3 rounded-lg bg-zinc-900 text-xs text-zinc-200 italic">
            "{complaint.description}"
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">Reported By</span>
              <span className="text-zinc-200">{complaint.reported_by}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">Location</span>
              <span className="text-zinc-200">{complaint.location_id} {complaint.room_or_area}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Reported At</span>
              <span className="text-zinc-200 font-mono">{complaint.reported_at}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">AI Intelligence & Cluster</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">Detected Category</span>
              <span className="text-zinc-200">{complaint.category}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">Assigned Incident</span>
              <span className="font-mono text-purple-400">{complaint.incident_id || 'None'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">Technician</span>
              <span className="text-zinc-200">{parentIncident?.assigned_technician_name || 'Not Dispatched'}</span>
            </div>
            <div className="py-1">
              <span className="text-zinc-500 block mb-0.5">Priority Justification:</span>
              <p className="text-zinc-300">{complaint.priority_reason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clustered Reports if any */}
      {relatedComplaints.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
          <h3 className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>Related Reports in Same Cluster ({relatedComplaints.length})</span>
          </h3>
          <div className="space-y-1.5">
            {relatedComplaints.map(rc => (
              <Link
                key={rc.report_id}
                href={`/complaints/${rc.report_id}`}
                className="block p-2.5 rounded-lg bg-zinc-900 text-xs hover:bg-zinc-850 transition"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-0.5">
                  <span className="font-mono text-blue-400 font-bold">{rc.report_id}</span>
                  <span>{rc.reported_by} • {rc.reported_at}</span>
                </div>
                <p className="text-zinc-300 truncate">{rc.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Technician"
        subtitle={`Ticket ${complaint.report_id}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
          <div className="space-y-1.5">
            {[
              { id: 'usr-tech-01', name: 'Ramesh Verma (HVAC Master)', role: 'HVAC Specialist' },
              { id: 'usr-tech-02', name: 'Anil Sharma (Senior Electrician)', role: 'Electrical Substation' },
              { id: 'usr-tech-03', name: 'Mohinder Singh (Plumbing Lead)', role: 'Water Systems' }
            ].map(tech => (
              <button
                key={tech.id}
                type="button"
                onClick={() => setSelectedTech(tech)}
                className={`w-full text-left p-2.5 rounded-lg border transition ${
                  selectedTech.id === tech.id
                    ? 'bg-blue-950/60 border-blue-600 text-white font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <p>{tech.name}</p>
                <p className="text-[10px] text-zinc-500">{tech.role}</p>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Confirm
            </button>
          </div>
        </form>
      </Modal>

      {/* Priority Modal */}
      <Modal
        isOpen={isPriorityModalOpen}
        onClose={() => setIsPriorityModalOpen(false)}
        title="Override Priority"
        subtitle={`Ticket ${complaint.report_id}`}
      >
        <form onSubmit={handlePrioritySubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">Select Priority</label>
            <div className="grid grid-cols-5 gap-1.5">
              {([5, 4, 3, 2, 1] as PriorityLevel[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setOverridePriority(p)}
                  className={`p-2 rounded text-xs font-bold border transition ${
                    overridePriority === p
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  P{p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Reason <span className="text-red-400">*</span></label>
            <textarea
              required
              rows={2}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Reason for priority change..."
              className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsPriorityModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Complaint Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Complaint"
        subtitle={`Ticket ${complaint.report_id}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Issue Title / Problem Type <span className="text-red-400">*</span></label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:border-blue-500 outline-none"
              placeholder="e.g. WiFi Slow Speed, Tap Leaking..."
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Building / Hostel <span className="text-red-400">*</span></label>
              <input
                type="text"
                required
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:border-blue-500 outline-none"
                placeholder="e.g. Hostel A, Block C..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Room / Area</label>
              <input
                type="text"
                value={editRoom}
                onChange={(e) => setEditRoom(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:border-blue-500 outline-none"
                placeholder="e.g. Room 152, 2nd floor..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Description <span className="text-red-400">*</span></label>
            <textarea
              required
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Describe the maintenance issue in detail..."
              className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:border-blue-500 outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Complaint"
        subtitle={`Ticket ${complaint.report_id}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-red-200 space-y-1">
            <p className="font-semibold text-red-300">Are you sure you want to permanently delete this complaint?</p>
            <p className="text-[11px] text-zinc-400">
              Ticket <strong>{complaint.report_id}</strong> ({complaint.problem_type}) will be cancelled and removed from the active triage queue.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
            >
              Keep Ticket
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirm Delete</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
