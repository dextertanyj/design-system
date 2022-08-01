import { Box, useStyles } from '@chakra-ui/react'

import { Button } from '~/Button'

import { useCalendar } from './CalendarContext'

export const CalendarTodayButton = (): JSX.Element => {
  const styles = useStyles()
  const { handleTodayClick, startDate, endDate } = useCalendar()

  const today = new Date().valueOf()

  // start and end dates have been normalized to start and end of day respectively in context
  const isDisabled =
    today.valueOf() < startDate.valueOf() || today.valueOf() > endDate.valueOf()

  return (
    <Box sx={styles.todayLinkContainer}>
      <Button
        disabled={isDisabled}
        variant="link"
        type="button"
        onClick={handleTodayClick}
        tabIndex={0}
      >
        Today
      </Button>
    </Box>
  )
}
