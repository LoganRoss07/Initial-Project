import { useState } from 'react'
import Card from '../components/Card'
import SegmentedControl from '../components/SegmentedControl'

function Home() {
  const [range, setRange] = useState('week')

  return (
    <div>
      <SegmentedControl
        label="Time range"
        value={range}
        onChange={setRange}
        options={[
          { value: 'week', label: 'This week' },
          { value: 'month', label: 'This month' },
          { value: 'all', label: 'All time' },
        ]}
      />
      <Card title="Workout Summary">
        <p>You picked: {range}</p>
      </Card>
    </div>
  )
}

export default Home