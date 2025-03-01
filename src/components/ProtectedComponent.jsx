import React from 'react';

const ProtectedComponent = () => {
  return (
    <div>
      <h1>Protected Component</h1>
      <p>This is a protected route. Only accessible to authenticated users.</p>
    </div>
  );
};

export default ProtectedComponent;
