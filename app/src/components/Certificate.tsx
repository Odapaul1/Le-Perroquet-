import React from 'react';
import { Award, Download, Share2 } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white border-[16px] border-[#D91A1A]/10 p-12 relative overflow-hidden print:border-0 print:p-0">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D91A1A]/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#001B71]/5 rounded-full -ml-32 -mb-32" />
        
        <div className="relative z-10 text-center space-y-8">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[#D91A1A] flex items-center justify-center">
              <Award className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-5xl text-[#1A1A1A]">Certificat de Réussite</h1>
            <p className="text-[#6B6B6B] uppercase tracking-[0.2em] font-medium">Certificate of Completion</p>
          </div>

          <div className="py-8">
            <p className="text-[#6B6B6B] text-lg italic">This is to certify that</p>
            <h2 className="text-4xl font-serif text-[#1A1A1A] mt-4 border-b-2 border-[#1A1A1A]/10 inline-block px-12 pb-2">
              {userName}
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-[#6B6B6B] text-lg">has successfully completed the course</p>
            <h3 className="text-3xl font-serif text-[#D91A1A]">{courseTitle}</h3>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-12">
            <div className="text-center space-y-2">
              <div className="border-b border-[#1A1A1A]/20 pb-2">
                <p className="font-serif text-xl">Jean-Luc Picard</p>
              </div>
              <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Director of Studies</p>
            </div>
            <div className="text-center space-y-2">
              <div className="border-b border-[#1A1A1A]/20 pb-2">
                <p className="font-serif text-xl">{completionDate}</p>
              </div>
              <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">Date of Issue</p>
            </div>
          </div>

          <div className="pt-8">
            <p className="text-[10px] text-[#6B6B6B] font-mono">Certificate ID: {certificateId}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4 print:hidden">
        <Button onClick={handleDownload} className="bg-[#1A1A1A] hover:bg-[#1A1A1A]/90">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share Achievement
        </Button>
      </div>
    </div>
  );
};
