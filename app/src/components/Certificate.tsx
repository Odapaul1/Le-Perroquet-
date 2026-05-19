import React from 'react';
import { Download, Share2, Award, QrCode } from 'lucide-react';
import { Button } from './ui/button';

interface CertificateProps {
  userName: string;
  courseTitle: string;
  completionDate: string;
  certificateId: string;
}

export const Certificate: React.FC<CertificateProps> = ({
  userName,
  courseTitle,
  completionDate,
  certificateId,
}) => {
  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Main Certificate Container */}
      <div className="bg-white border-[12px] border-[#004d2c] p-1 relative overflow-hidden shadow-2xl print:border-[12px] print:shadow-none">
        {/* Inner Border */}
        <div className="border-[2px] border-[#00a651] p-0 md:p-8 flex flex-col md:flex-row min-h-[600px] relative">
          
          {/* Left Sidebar - Seal and Branding */}
          <div className="w-full md:w-1/4 bg-[#f4f7f4] p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-gray-200">
            {/* Top Seal Area */}
            <div className="flex flex-col items-center pt-8">
              <div className="relative mb-4">
                {/* Silver Seal Decoration */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 via-gray-300 to-gray-400 p-1 shadow-lg flex items-center justify-center relative z-10">
                  <div className="w-full h-full rounded-full border-2 border-white/50 flex items-center justify-center">
                    <Award className="w-16 h-16 text-gray-600 opacity-80" />
                  </div>
                </div>
                {/* Green Ribbons */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-16 h-24 bg-[#00a651] -z-10 origin-top rotate-[15deg] rounded-b-sm shadow-md" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-16 h-24 bg-[#00a651] -z-10 origin-top -rotate-[15deg] rounded-b-sm shadow-md" />
              </div>
            </div>

            {/* CPD Certified Badge Style */}
            <div className="flex flex-col items-center space-y-1 mb-8">
              <div className="text-[#5b3294] font-bold text-xl leading-none">CPD</div>
              <div className="text-[#5b3294] text-[10px] font-bold uppercase tracking-tighter">Certified</div>
              <div className="text-[8px] text-gray-500 text-center max-w-[80px]">The CPD Certification Service</div>
            </div>

            {/* Date Area */}
            <div className="text-center pt-4 border-t border-gray-300 w-full">
              <div className="text-sm font-bold text-gray-800">{completionDate}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Date of Award</div>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 p-6 md:p-12 flex flex-col justify-between bg-white relative">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] border-[1px] border-gray-800 rounded-full -mr-64 -mt-64" />
               <div className="absolute bottom-0 left-0 w-[300px] h-[300px] border-[1px] border-gray-800 rounded-full -ml-32 -mb-32" />
            </div>

            {/* Organization Header */}
            <div className="flex flex-col items-start mb-12">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-gradient-to-tr from-[#D91A1A] via-[#001B71] to-[#D4AF37] flex items-center justify-center text-white font-bold text-xl">L</div>
                <span className="font-serif text-2xl font-bold tracking-tight text-gray-800">Le' Perroque</span>
              </div>
              <span className="text-[9px] text-gray-400 font-bold tracking-[0.2em] ml-10 -mt-1 uppercase">Empower Yourself</span>
            </div>

            {/* Certificate Content */}
            <div className="space-y-6 flex-1">
              <div className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mb-2">Certificate</div>
              
              <h2 className="text-5xl font-serif text-gray-800 font-bold tracking-tight">
                {userName}
              </h2>
              
              <div className="space-y-4 pt-4 max-w-lg">
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  has been awarded a certificate for successfully completing the course:
                </p>
                <h3 className="text-2xl font-serif text-gray-800 font-bold leading-tight border-l-4 border-[#00a651] pl-4 py-1">
                  {courseTitle}
                </h3>
              </div>
            </div>

            {/* Footer with Verification and Signature */}
            <div className="mt-16 flex flex-col md:flex-row items-end justify-between gap-8 border-t border-gray-100 pt-8">
              {/* Verification Info */}
              <div className="flex items-start gap-4">
                <div className="p-1 border border-gray-200 rounded bg-white">
                  <QrCode className="w-12 h-12 text-gray-800" />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">To verify:</p>
                  <p className="text-[10px] text-gray-700 font-mono">ID: {certificateId}</p>
                  <p className="text-[10px] text-blue-600 hover:underline cursor-pointer">le-perroque.com/verify/{certificateId}</p>
                </div>
              </div>

              {/* Signature Area */}
              <div className="text-right space-y-1">
                <div className="font-serif text-xl text-gray-800 italic pr-2">Maurice Richardson</div>
                <div className="h-px bg-gray-300 w-48 ml-auto" />
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Director of Certification</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center gap-4 print:hidden">
        <Button onClick={handleDownload} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 h-11 px-8">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" className="h-11 px-8">
          <Share2 className="w-4 h-4 mr-2" />
          Share Achievement
        </Button>
      </div>
    </div>
  );
};
