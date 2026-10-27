"use client";

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { parseComplaintText } from '@/lib/ai-simulator';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { LocationType, Complaint } from '@/lib/types';
import { Send, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';

export default function ReportPage() {
  const { submitComplaint, complaints } = useApp();

  const [description, setDescription] = useState('');
  const [locationType, setLocationType] = useState<LocationType>('Hostel');
  const [locationId, setLocationId] = useState('Hostel H');
  const [roomOrArea, setRoomOrArea] = useState('Room 214');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);

  const locationOptions: Record<LocationType, string[]> = {
    'Hostel': Array.from({ length: 20 }, (_, i) => `Hostel ${String.fromCharCode(65 + i)}`),
    'Block': ['Block A', 'Block B', 'Block C', 'Block D', 'Block E', 'Block F', 'Block G'],
    'Lecture Theatre': ['LT-101', 'LT-102', 'LT-103', 'LT-104', 'LT-105', 'LT-106', 'LT-107', 'LT-108', 'LT-201', 'LT-202', 'LT-203', 'LT-204', 'LT-205', 'LT-206', 'LT-207', 'LT-208', 'LT-301', 'LT-302', 'LT-303', 'LT-304'],
    'CSED': ['CSED-Lab-1', 'CSED-Lab-2', 'CSED-Lab-3', 'CSED-Lab-4', 'CSED-Server-Room', 'CSED-Seminar-Hall', 'CSED-Office'],
    'Library': ['Library-Ground', 'Library-First', 'Library-Second', 'Library-Reading-Hall', 'Library-Reference', 'Library-Computer-Lab']
  };

  const sampleTemplates = [
    { label: 'AC Failure', text: "AC in Hostel H room 214 isn't cooling since morning.", type: 'Hostel' as LocationType, loc: 'Hostel H', room: 'Room 214' },
    { label: 'Sparks / Burning Smell', text: "Electrical sparks and burning smell in Hostel H Room 215.", type: 'Hostel' as LocationType, loc: 'Hostel H', room: 'Room 215' },
    { label: 'Water Cutoff', text: "Water supply stopped completely across 3rd floor in Hostel K.", type: 'Hostel' as LocationType, loc: 'Hostel K', room: 'Room 320' },
    { label: 'Lift Stuck', text: "Hostel A passenger lift is stuck on floor 3.", type: 'Hostel' as LocationType, loc: 'Hostel A', room: 'Main Tower' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const result = submitComplaint({
        description,
        location_id: locationId,
        location_type: locationType,
        room_or_area: roomOrArea
      });
      setIsSubmitting(false);
      setCreatedComplaint(result);
    }, 200);
  };

  const resetForm = () => {
    setDescription('');
    setCreatedComplaint(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Report a Maintenance Problem
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Describe the problem in plain text. Location and severity are structured automatically.
        </p>
      </div>

      {/* Quick Templates */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-zinc-500 font-medium">Examples:</span>
        {sampleTemplates.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => {
              setDescription(t.text);
              setLocationType(t.type);
              setLocationId(t.loc);
              setRoomOrArea(t.room);
            }}
            className="text-xs px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">
            Problem Description <span className="text-red-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue (e.g. 'AC in Hostel H room 214 isn't cooling since morning')"
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 outline-none transition leading-relaxed"
          />
        </div>

        {/* Location Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-400">Campus Area</label>
            <select
              value={locationType}
              onChange={(e) => {
                const newType = e.target.value as LocationType;
                setLocationType(newType);
                setLocationId(locationOptions[newType][0]);
              }}
              className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:border-blue-500 outline-none"
            >
              <option value="Hostel">Hostels (A–T)</option>
              <option value="Block">Academic Blocks (A–G)</option>
              <option value="Lecture Theatre">Lecture Theatres (LT 101–304)</option>
              <option value="CSED">CSED & Labs</option>
              <option value="Library">Library</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-400">Specific Building</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:border-blue-500 outline-none"
            >
              {locationOptions[locationType].map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-400">Room / Area (Optional)</label>
          <input
            type="text"
            value={roomOrArea}
            onChange={(e) => setRoomOrArea(e.target.value)}
            placeholder="e.g. Room 214"
            className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:border-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !description.trim()}
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSubmitting ? 'Submitting...' : 'Submit Complaint'}</span>
        </button>
      </form>

      {/* Confirmation Modal */}
      {createdComplaint && (
        <Modal
          isOpen={!!createdComplaint}
          onClose={resetForm}
          title="Complaint Registered"
          subtitle={`Ticket ID: ${createdComplaint.report_id}`}
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <div>
                <span className="text-zinc-500 block text-[10px]">Category</span>
                <span className="font-semibold text-zinc-200">{createdComplaint.category}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Problem Type</span>
                <span className="font-semibold text-zinc-200">{createdComplaint.problem_type}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Location</span>
                <span className="font-semibold text-zinc-200">{createdComplaint.location_id} {createdComplaint.room_or_area}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Recommended Priority</span>
                <div className="mt-0.5"><PriorityBadge priority={createdComplaint.ground_truth_priority} /></div>
              </div>
            </div>

            {createdComplaint.is_duplicate_of && (
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                <span className="font-semibold text-purple-400 block">Probable Duplicate Group:</span>
                <span>Grouped with ongoing ticket {createdComplaint.is_duplicate_of}.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Submit Another
              </button>
              <Link
                href={`/complaints/${createdComplaint.report_id}`}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <span>Track Ticket</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
