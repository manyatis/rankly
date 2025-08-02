// Fix for ensuring the 'link-website' tab can always be selected when there are 0 businesses.

// Logic to enable the 'link-website' tab regardless of business count
const businessesCount = 0; // Example count
const isLinkWebsiteTabEnabled = businessesCount === 0;

// Component rendering
return (
  <div>
    <button disabled={!isLinkWebsiteTabEnabled}>Link Website</button>
    {/* Other buttons */}
  </div>
);