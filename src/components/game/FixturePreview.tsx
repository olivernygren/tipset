import React from 'react'
import { Fixture } from '../../utils/Fixture';

interface FixturePreviewProps {
  fixture: Fixture;
};

// use this component for listing the created fixtures in new game weeks

const FixturePreview = ({ fixture }: FixturePreviewProps) => {
  return (
    <div>FixturePreview</div>
  )
};

export default FixturePreview;