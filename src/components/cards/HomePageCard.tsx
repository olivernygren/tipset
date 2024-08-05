import { motion } from 'framer-motion'
import React, { useState } from 'react'
import styled from 'styled-components';
import { devices, theme } from '../../theme';
import { Section } from '../section/Section';
import { HeadingsTypography, NormalTypography } from '../typography/Typography';
import { ArrowRight, Scroll, Trophy } from '@phosphor-icons/react';

interface HomePageCardProps {
  title: string;
  description: string;
  href: string;
}

const HomePageCard = ({ title, description, href }: HomePageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    switch (title) {
      case 'Ligor':
        return <Trophy size={42} color={isHovered ? theme.colors.gold : theme.colors.textDefault} weight='fill' />;
      case 'Regler':
        return <Scroll size={42} color={isHovered ? theme.colors.gold : theme.colors.textDefault} weight='fill' />;
      default:
        return <Trophy size={32} color={theme.colors.primary} />;
    }
  }

  return (
    <StyledLink href={href}>
      <Card
        initial={{ opacity: 0, backgroundColor: theme.colors.white, border: `1px solid ${theme.colors.silver}` }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        whileHover={{ scale: 1.01, backgroundColor: theme.colors.primary, border: `2px solid ${theme.colors.gold}` }}
        whileTap={{ scale: 1, backgroundColor: theme.colors.primary }}
        transition={{ duration: 0.2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Section gap="m">
          <Section flexDirection='row' alignItems='center' gap='s'>
            <HeadingsTypography variant='h2' color={isHovered ? theme.colors.gold : theme.colors.textDefault}>{title}</HeadingsTypography>
            {getIcon()}
          </Section>
          <NormalTypography variant='l' color={isHovered ? theme.colors.white : theme.colors.textDefault}>{description}</NormalTypography>
        </Section>
        <ArrowIconContainer isHovered={isHovered}>
          <ArrowRight size={40} color={isHovered ? theme.colors.gold : theme.colors.white} weight='bold' />
        </ArrowIconContainer>
      </Card>
    </StyledLink>
  )
}

const StyledLink = styled.a`
  text-decoration: none;
  width: 100%;
  box-sizing: border-box;
`;

const Card = styled(motion.div)`
  width: 100%;
  box-sizing: border-box;
  padding: ${theme.spacing.m};
  border-radius: ${theme.borderRadius.l};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ArrowIconContainer = styled.div<{ isHovered: boolean }>`
  display: none;
  
  @media ${devices.tablet} {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${({ isHovered }) => isHovered ? theme.colors.primaryDarker : theme.colors.white};
    box-sizing: border-box;
    width: 100px;
    height: 100px;
    padding: 30px;
    border-radius: 50px;
  }
`;

export default HomePageCard;