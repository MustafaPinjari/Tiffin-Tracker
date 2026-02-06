import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WrenchScrewdriverIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { mobileDataDiagnosis, mobileDataRepair, DataReport } from '../utils/mobileDataFix';

interface MobileDataFixProps {
  onDataFixed: () => void;
}

export function MobileDataFix({ onDataFixed }: MobileDataFixProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<DataReport | null>(null);
  const [step, setStep] = useState<'initial' | 'diagnosis' | 'repair' | 'complete'>('initial');

  const handleDiagnosis = async () => {
    setIsLoading(true);
    setStep('diagnosis');
    
    // Add delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const diagnosisReport = mobileDataDiagnosis();
    setReport(diagnosisReport);
    setIsLoading(false);
  };

  const handleRepair = async () => {
    setIsLoading(true);
    setStep('repair');
    
    // Add delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const repairReport = mobileDataRepair();
    setReport(repairReport);
    setIsLoading(false);
    setStep('complete');
    
    if (repairReport.success) {
      // Refresh data after successful repair
      setTimeout(() => {
        onDataFixed();
      }, 2000);
    }
  };

  const resetFlow = () => {
    setStep('initial');
    setReport(null);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-2xl font-medium flex items-center justify-center gap-2"
      >
        <WrenchScrewdriverIcon className="h-5 w-5" />
        Fix Data Issues
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Data Repair Tool</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Initial Step */}
          {step === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="text-gray-300 mb-6">
                If your order history isn't showing all data, this tool can help fix the issue.
              </p>
              
              <button
                onClick={handleDiagnosis}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-2xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <WrenchScrewdriverIcon className="h-5 w-5" />
                )}
                Check My Data
              </button>
            </motion.div>
          )}

          {/* Diagnosis Step */}
          {step === 'diagnosis' && (
            <motion.div
              key="diagnosis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {isLoading ? (
                <div className="text-center py-8">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
                  <p className="text-white">Checking your data...</p>
                </div>
              ) : report ? (
                <div>
                  <div className={`flex items-center gap-2 mb-4 ${report.success ? 'text-green-400' : 'text-yellow-400'}`}>
                    {report.success ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : (
                      <ExclamationTriangleIcon className="h-6 w-6" />
                    )}
                    <span className="font-medium">Diagnosis Complete</span>
                  </div>

                  <div className="bg-gray-800 rounded-2xl p-4 mb-4">
                    <p className="text-white mb-2">{report.message}</p>
                    <p className="text-gray-400 text-sm">Found {report.details.originalCount} orders</p>
                  </div>

                  {report.details.issuesFound.length > 0 && (
                    <div className="bg-yellow-900 bg-opacity-30 rounded-2xl p-4 mb-4">
                      <p className="text-yellow-400 font-medium mb-2">Issues Found:</p>
                      {report.details.issuesFound.map((issue, index) => (
                        <p key={index} className="text-yellow-300 text-sm">• {issue}</p>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={resetFlow}
                      className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-2xl font-medium"
                    >
                      Back
                    </button>
                    {!report.success && (
                      <button
                        onClick={handleRepair}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-2xl font-medium"
                      >
                        Fix Issues
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* Repair Step */}
          {step === 'repair' && (
            <motion.div
              key="repair"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center py-8"
            >
              <ArrowPathIcon className="h-8 w-8 animate-spin text-green-400 mx-auto mb-4" />
              <p className="text-white mb-2">Repairing your data...</p>
              <p className="text-gray-400 text-sm">This may take a moment</p>
            </motion.div>
          )}

          {/* Complete Step */}
          {step === 'complete' && report && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className={`flex items-center gap-2 mb-4 ${report.success ? 'text-green-400' : 'text-red-400'}`}>
                {report.success ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  <XCircleIcon className="h-6 w-6" />
                )}
                <span className="font-medium">
                  {report.success ? 'Repair Complete!' : 'Repair Failed'}
                </span>
              </div>

              <div className="bg-gray-800 rounded-2xl p-4 mb-4">
                <p className="text-white mb-2">{report.message}</p>
                {report.success && (
                  <p className="text-green-400 text-sm">
                    {report.details.repairedCount} orders are now ready to use
                  </p>
                )}
              </div>

              {report.details.actionsTaken.length > 0 && (
                <div className="bg-green-900 bg-opacity-30 rounded-2xl p-4 mb-4">
                  <p className="text-green-400 font-medium mb-2">Actions Taken:</p>
                  {report.details.actionsTaken.map((action, index) => (
                    <p key={index} className="text-green-300 text-sm">• {action}</p>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  resetFlow();
                }}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-2xl font-medium"
              >
                {report.success ? 'Done' : 'Close'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}