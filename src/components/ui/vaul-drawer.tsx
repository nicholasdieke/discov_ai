"use client"

import { Box } from "@chakra-ui/react"
import { forwardRef, useState } from "react"
import { Drawer } from "vaul"

const snapPoints = [0.55, 1]

interface AdditionalDrawerProps {
  description: string
}

export const MyDrawer = forwardRef<
  React.ElementRef<typeof Drawer.Content>,
  React.ComponentPropsWithoutRef<typeof Drawer.Content> & AdditionalDrawerProps
>(({ className, title, description, children, ...props }, ref) => {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[1]!)

  return (
    <div style={{ zIndex: 999 }}>
      <Drawer.Root
        dismissible={false}
        shouldScaleBackground={true}
        snapPoints={snapPoints}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
        modal={false}
        open={true}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="drawer-overlay" />
          <Drawer.Content className="drawer-content">
            <div className="drag-pill" />

            <div className="scrollable">
              <div className="scrollableInner">
                <div className="header">
                  <Drawer.Title className="drawer-title">{title}</Drawer.Title>
                  <Drawer.Description className="drawer-description">
                    {description}
                  </Drawer.Description>
                </div>

                <Box p="3" pb="0">
                  {children}
                </Box>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
})
