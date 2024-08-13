import { motion } from 'framer-motion';
import React, { useState } from 'react';
import styled from 'styled-components';
import {
  ArrowRight, Question, Scroll, Trophy,
} from '@phosphor-icons/react';
import { devices, theme } from '../../theme';
import { Section } from '../section/Section';
import { HeadingsTypography, NormalTypography } from '../typography/Typography';
import useResizeListener, { DeviceSizes } from '../../utils/hooks/useResizeListener';

interface HomePageCardProps {
  title: string;
  description: string;
  href: string;
}

const HomePageCard = ({ title, description, href }: HomePageCardProps) => {
  const isMobile = useResizeListener(DeviceSizes.MOBILE);

  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    switch (title) {
      case 'Ligor':
        return <Trophy size={isMobile ? 32 : 42} color={isHovered && !isMobile ? theme.colors.gold : theme.colors.textDefault} weight="fill" />;
      case 'Regler':
        return <Scroll size={isMobile ? 32 : 42} color={isHovered && !isMobile ? theme.colors.gold : theme.colors.textDefault} weight="fill" />;
      case 'Hur funkar det?':
        return <Question size={isMobile ? 32 : 42} color={isHovered && !isMobile ? theme.colors.gold : theme.colors.textDefault} weight="fill" />;
      default:
        return null;
    }
  };

  return (
    <StyledLink href={href}>
      <Card
        initial={{
          opacity: 0,
          backgroundColor: !isMobile ? theme.colors.white : undefined,
          border: !isMobile ? `1px solid ${theme.colors.silverLight}` : undefined,
        }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        whileHover={{
          scale: 1.01,
          backgroundColor: !isMobile ? theme.colors.primary : undefined,
          border: !isMobile ? `2px solid ${theme.colors.gold}` : undefined,
        }}
        whileTap={{
          scale: 0.98,
          backgroundColor: !isMobile ? theme.colors.primary : undefined,
        }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Section gap={isMobile ? 'xs' : 'm'}>
          <Section flexDirection="row" alignItems="center" gap={isMobile ? 'xs' : 's'}>
            <HeadingsTypography variant={isMobile ? 'h3' : 'h2'} color={isHovered && !isMobile ? theme.colors.gold : theme.colors.textDefault}>{title}</HeadingsTypography>
            {getIcon()}
          </Section>
          <NormalTypography variant={isMobile ? 'm' : 'l'} color={isHovered && !isMobile ? theme.colors.white : theme.colors.silverDark}>{description}</NormalTypography>
        </Section>
        {!isMobile && (
          <ArrowIconContainer isHovered={isHovered}>
            <ArrowRight size={40} color={isHovered ? theme.colors.gold : theme.colors.white} weight="bold" />
          </ArrowIconContainer>
        )}
      </Card>
    </StyledLink>
  );
};

const StyledLink = styled.a`
  text-decoration: none;
  width: 100%;
  box-sizing: border-box;
`;

const Card = styled(motion.div)`
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
  border-radius: ${theme.borderRadius.l};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media ${devices.tablet} {
    padding: ${theme.spacing.m};
  }
`;

const ArrowIconContainer = styled.div<{ isHovered: boolean }>`
  display: none;
  
  @media ${devices.tablet} {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${({ isHovered }) => (isHovered ? theme.colors.primaryDarker : theme.colors.white)};
    box-sizing: border-box;
    width: 100px;
    height: 100px;
    padding: 30px;
    border-radius: 50px;
  }
`;

export default HomePageCard;
