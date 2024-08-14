import React from 'react';
import Skeleton, { SkeletonProps } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { theme } from '../../theme';

const CustomSkeleton = (props: SkeletonProps) => (
  <Skeleton
    {...props}
    baseColor={theme.colors.silverLight}
    highlightColor={theme.colors.silverLighter}
  />
);

export const ParagraphSkeleton = (props: SkeletonProps) => (
  <Skeleton
    {...props}
    borderRadius={2}
    baseColor={theme.colors.silverLight}
    highlightColor={theme.colors.silverLighter}
  />
);

export default CustomSkeleton;
