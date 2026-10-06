export interface EntityCardStyleConfig {
  bg: string;
  border: string;
  iconBg: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  defaultIcon: string;
}

export interface CameraStateConfig {
  flashMode: 'off' | 'on';
  autoDetect: boolean;
  sharpnessPercentage: number;
}
