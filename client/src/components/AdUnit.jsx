import React, { useEffect, useRef } from 'react';

export default function AdUnit({ adSlot, format = 'auto', className = '' }) {
  const ref = useRef(null);
  const key = `${adSlot}-${format}`;

  useEffect(() => {
    if (ref.current && window.adsbygoogle) {
      try {
        window.adsbygoogle.push({});
      } catch {
        // Ad blocker or no fill — silent
      }
    }
  }, [key]);

  return (
    <div className={className} style={{ overflow: 'hidden' }}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5428576975342216"
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
