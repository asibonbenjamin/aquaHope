export default function Gallery() {
  const ids = [
    'photo-1559072232-4d6a511a9996',
    'photo-1499392448005-1e0873ff02b4',
    'photo-1547051492-7f87fb92eedd',
    'photo-1531306728370-e2ebd9d7bb99',
    'photo-1519681393784-d120267933ba',
    'photo-1520975922323-2f7f38478238',
    'photo-1476041800959-2f6bb412c8ce',
    'photo-1558980664-10a2d2acb7bb',
  ]

  return (
    <div>
      <div className="page-hero">
        <div className="pill">Our Gallery</div>
        <h2 style={{ margin: '6px 0 10px' }}>Communities and Impact</h2>
        <p className="muted">Stories of communities striving for clean water access.</p>
      </div>
      <div className="gallery-grid">
        <img src="animal.png" alt="" />
        <img src="business.png" alt="" />
        <img src="education.png" alt="" />
        <img src="emergency.png" alt="" />
        <img src="other.png" alt="" />
      </div>
    </div>
  )
}


