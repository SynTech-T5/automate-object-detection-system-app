"use client"

import React from 'react';

// โครงสร้าง props
interface StatusCardProps {
    id: number; 
    title: string;
    value: string;
    totalValue?: string; // เพิ่ม prop ใหม่สำหรับค่าตัวเลขรวม
    subtitle?: string;
    IconComponent: React.ReactNode;
    textColorClass: string;
}

// 1.ฟังก์ชั้นสร้าง status card แต่ละตัว
const StatusCard: React.FC<StatusCardProps> = (props) => {
    const { id, title, value, totalValue, subtitle, IconComponent, textColorClass } = props;

    // ตรวจสอบว่าเป็น ID ในกลุ่ม 1, 3, 5, 7 ซึ่งอยู่ในหน้าเมนู Alerts
    const isCardInAlertsMenu = [1, 3, 5, 7].includes(id);

    if (isCardInAlertsMenu) {
        return (
            // ลบคลาส w-[400px] ออกเพื่อให้รองรับ responsive
            <div className="bg-white rounded-[10px] shadow-md border border-gray-100 w-full h-[120px] flex flex-col justify-between">
                {/* ปรับขนาด padding ให้เหมาะสมกับทุกหน้าจอ */}
                <div className='px-4 pt-[14px] pb-[15px] md:px-[30px]'>
                    {/* ส่วน Title */}
                    <div>
                       <h4 className="text-sm md:text-base font-medium text-[#000000]">{title}</h4>
                    </div>
                    {/* ส่วน ไอคอน และ จำนวน */}
                    <div className="flex items-center gap-x-[10px] mt-1">
                        <div className={`w-[30px] h-[30px] flex items-center justify-center ${textColorClass}`}>
                            {IconComponent}
                        </div>
                        <div className={`text-2xl md:text-[24px] font-medium pb-1 ${textColorClass}`}>{value}</div>
                    </div>
                    {/* ส่วน คำอธิบาย */}
                    <div>
                        <p className="text-[10px] font-medium mt-1 text-[#8C8686]">{subtitle}</p>
                    </div>
                </div>
            </div>
        );
    } else {
        // สำหรับการ์ดที่มี ID 2, 4, 6, 8 ซึ่งอยู่ในหน้าเมนู Cameras
        return (
            // ลบคลาส w-[400px] ออกเพื่อให้รองรับ responsive
            <div className="bg-white rounded-[10px] shadow-md border border-gray-100 w-full h-[120px] flex flex-col justify-between">
                {/* ปรับขนาด padding ให้เหมาะสมกับทุกหน้าจอ */}
                <div className='px-4 py-[25px] md:px-[30px]'>
                    <h4 className="text-sm md:text-base font-medium text-[#000000]">{title}</h4>
                    <div className="flex items-center gap-x-[10px] mt-2">
                        <div className={`w-[30px] h-[30px] flex items-center justify-center ${textColorClass}`}>
                            {IconComponent}
                        </div>

                        <div className="flex items-baseline gap-x-1">
                            {/* ปรับขนาด font ให้เหมาะสมกับทุกหน้าจอ */}
                            <span className={`text-2xl md:text-[24px] font-medium pb-1 ${textColorClass}`}>{value}</span>

                            {totalValue && ( // ถ้ามีค่า totalValue ถึงจะแสดง ถ้าไม่มี ก็ไม่โชว์อะไรเลย
                                <>
                                    {/* แสดงเครื่องหมาย / ไว้คั่นระหว่าง value กับ totalValue */}
                                    <span className="text-base md:text-[16px] text-[#8C8686] font-medium pb-1">/</span>

                                    {/* แสดงค่ารวมทั้งหมด (totalValue) ต่อท้ายหลังจาก / */}
                                    <span className="text-sm md:text-[12px] text-[#8C8686] font-medium pb-1">{totalValue}</span>
                                </>
                            )}
                        </div>
                    </div>
                    {subtitle && <p className="text-[12px] font-normal mt-1 text-gray-500">{subtitle}</p>}
                </div>
            </div>
        );
    }
};

// 2. ข้อมูลของการ์ดทั้งหมด
const summaryCards = [
    {
        id: 1,
        title: "Total Alerts",
        value: "12",
        subtitle: "Last 7 days",
        // เพิ่มคลาส text-[30px] เพื่อขยายขนาดไอคอนให้เต็ม div
        IconComponent: <i className="fi fi-br-bells text-[30px] leading-none"></i>,
        textColorClass: "text-[#0077ff]"
    },
    {
        id: 2,
        title: "Total Cameras",
        value: "8",
        subtitle: "",
        IconComponent: <i className="fi fi-br-video-camera-alt text-[30px] leading-none"></i>,
        textColorClass: "text-[#0077ff]"
    },
    {
        id: 3,
        title: "Active Alerts",
        value: "5",
        subtitle: "Require attention",
        IconComponent: <i className="fi fi-br-info text-[30px] leading-none"></i>,
        textColorClass: "text-[#FF0000]"
    },
    {
        id: 4,
        title: "Active Cameras",
        value: "7",
        totalValue: "8", // เพิ่ม prop totalValue
        subtitle: "",
        IconComponent: <i className="fi fi-rr-check-circle text-[30px] leading-none"></i>,
        textColorClass: "text-[#3BCF00]"
    },
    {
        id: 5,
        title: "Resolved Alerts",
        value: "5",
        subtitle: "Successfully handled",
        IconComponent: <i className="fi fi-br-check-circle text-[30px] leading-none"></i>,
        textColorClass: "text-[#3BCF00]"
    },
    {
        id: 6,
        title: "Inactive Cameras",
        value: "1",
        subtitle: "",
        IconComponent: <i className="fi fi-rr-cross-circle text-[30px] leading-none"></i>,
        textColorClass: "text-[#FF2D2D]"
    },
    {
        id: 7,
        title: "Critical Alerts",
        value: "3",
        subtitle: "High priority",
        IconComponent: <i className="fi fi-br-triangle-warning text-[30px] leading-none"></i>,
        textColorClass: "text-[#FF2D2D]"
    },
    {
        id: 8,
        title: "Avg. Camera Health",
        value: "83 %",
        subtitle: "",
        IconComponent: <i className="fi fi-br-circle-heart text-[30px] leading-none"></i>,
        textColorClass: "text-[#FFCC00]"
    },
];


// 3. สร้างคอมโพเนนต์แต่ละตัว
const findCardData = (id: number) => summaryCards.find(card => card.id === id);


// 4.export ไปให้คนอื่นใช้
export const TotalAlertsCard = () => {
    const cardData = findCardData(1);
    return cardData ? <StatusCard {...cardData} /> : null;
};

export const TotalCamerasCard = () => {
    const cardData = findCardData(2);
    return cardData ? <StatusCard {...cardData} /> : null;
};

export const ActiveAlertsCard = () => {
    const cardData = findCardData(3);
    return cardData ? <StatusCard {...cardData} /> : null;
};

export const ActiveCamerasCard = () => {
    const cardData = findCardData(4);
    return cardData ? <StatusCard {...cardData} /> : null;
};

export const ResolvedAlertsCard = () => {
    const cardData = findCardData(5);
    return cardData ? <StatusCard {...cardData} /> : null;
};

export const InactiveCamerasCard = () => {
    const cardData = findCardData(6);
    return cardData ? <StatusCard {...cardData} /> : null;
};

export const CriticalAlertsCard = () => {
    const cardData = findCardData(7);
    return cardData ? <StatusCard {...cardData} /> : null;
};

export const AvgCameraHealthCard = () => {
    const cardData = findCardData(8);
    return cardData ? <StatusCard {...cardData} /> : null;
};
