'use client';

interface WarningBannerProps {
    type: 'danger' | 'warning' | 'info';
    icon: string;
    message: string;
}

export default function WarningBanner({ type, icon, message }: WarningBannerProps) {
    return (
        <div className={`warning-banner warning-banner--${type}`}>
            <span>{icon}</span>
            <span>{message}</span>
        </div>
    );
}
