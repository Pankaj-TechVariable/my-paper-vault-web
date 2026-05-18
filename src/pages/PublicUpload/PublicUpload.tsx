import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MdErrorOutline, MdOutlineTimer, MdOutlineStackedBarChart } from 'react-icons/md';
import { usePublicUploadLink } from '@/hooks/useUploadLink';
import TopBar from './components/TopBar';
import HeroSection from './components/HeroSection';
import StatsGrid from './components/StatsGrid';
import SkeletonCard from './components/SkeletonCard';
import UploadArea from './components/UploadArea';
import SuccessState from './components/SuccessState';

const PublicUpload = () => {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = usePublicUploadLink(token!);
  const [uploadCount, setUploadCount] = useState(0);

  const info = data?.data;
  const slotsRemaining = info ? info.max_file_count - info.uploaded_count : 0;
  const isExpired = info ? new Date(info.expires_at) < new Date() : false;
  const noSlots = info ? slotsRemaining <= 0 : false;
  const isReady = !!info && !isExpired && !noSlots;

  const renderCardContent = () => {
    if (isLoading) return <SkeletonCard />;

    if (error || !info) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <MdErrorOutline size={28} className="text-red-400" />
          </div>
          <p className="text-base font-bold text-slate-800 mb-1">Link not found</p>
          <p className="text-sm text-slate-400">This upload link is invalid or has been removed.</p>
        </div>
      );
    }

    if (isExpired) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <MdOutlineTimer size={28} className="text-amber-400" />
          </div>
          <p className="text-base font-bold text-slate-800 mb-1">Link expired</p>
          <p className="text-sm text-slate-400">
            This link expired on{' '}
            {new Date(info.expires_at).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
            .
          </p>
        </div>
      );
    }

    if (noSlots) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <MdOutlineStackedBarChart size={28} className="text-amber-400" />
          </div>
          <p className="text-base font-bold text-slate-800 mb-1">Upload limit reached</p>
          <p className="text-sm text-slate-400">
            All {info.max_file_count} upload slot{info.max_file_count !== 1 ? 's' : ''} for this link
            have been used.
          </p>
        </div>
      );
    }

    if (uploadCount > 0) {
      return (
        <SuccessState
          count={uploadCount}
          canUploadMore={slotsRemaining > 0}
          onReset={() => setUploadCount(0)}
        />
      );
    }

    return (
      <>
        <HeroSection ownerName={info.owner_name} directoryName={info.directory_name} />
        <StatsGrid
          expiresAt={info.expires_at}
          maxFileSize={info.max_file_size}
          slotsRemaining={slotsRemaining}
          maxFileCount={info.max_file_count}
        />
        <UploadArea
          token={token!}
          info={info}
          slotsRemaining={slotsRemaining}
          onSuccess={setUploadCount}
        />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {renderCardContent()}
          </div>
          {isReady && uploadCount === 0 && (
            <p className="text-center text-xs text-slate-400 mt-5 leading-relaxed">
              Your privacy is our priority. Files are encrypted in transit (TLS 1.3) and at rest
              (AES-256).
              <br />
              No one at MyPaperVault can access your files.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicUpload;
