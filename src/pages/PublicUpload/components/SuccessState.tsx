import { MdCheckCircleOutline } from 'react-icons/md';
import Button from '@/components/common/Button/Button';

interface SuccessStateProps {
  count: number;
  canUploadMore: boolean;
  onReset: () => void;
}

const SuccessState = ({ count, canUploadMore, onReset }: SuccessStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
      <MdCheckCircleOutline size={36} className="text-green-500" />
    </div>
    <p className="text-base font-bold text-slate-800 mb-1">Upload complete!</p>
    <p className="text-sm text-slate-500 mb-6">
      {count === 1 ? '1 file was' : `${count} files were`} securely delivered to the vault.
    </p>
    {canUploadMore && (
      <Button label="Upload more files" variant="outlined" onClick={onReset} />
    )}
  </div>
);

export default SuccessState;
