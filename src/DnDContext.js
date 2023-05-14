import { DropTarget } from 'react-dnd'
import { getPos } from './Util'
import { DnDTypes } from './DnDTypes'
import { CellUnit, DATETIME_FORMAT } from './index'
import ViewType from './ViewType'

export default class DnDContext {
  constructor(sources, DecoratedComponent) {
    this.sourceMap = new Map();
    sources.forEach((item) => {
      this.sourceMap.set(item.dndType, item);
    })
    this.DecoratedComponent = DecoratedComponent;
  }

  getDropSpec = () => {
    return {
      drop: (props, monitor, component) => {
        const { schedulerData, resourceEvents } = props;
        const { cellUnit, localeDayjs } = schedulerData;
        const type = monitor.getItemType();
        const pos = getPos(component.eventContainer);
        let cellWidth = schedulerData.getContentCellWidth();
        let initialStartTime = null, initialEndTime = null;
        if (type === DnDTypes.EVENT) {
          const initialPoint = monitor.getInitialClientOffset();
          let initialLeftIndex = Math.floor((initialPoint.x - pos.x) / cellWidth);
          initialStartTime = resourceEvents.headerItems[initialLeftIndex].start;
          initialEndTime = resourceEvents.headerItems[initialLeftIndex].end;
          if (cellUnit !== CellUnit.Hour)
            initialEndTime = localeDayjs(new Date(resourceEvents.headerItems[initialLeftIndex].start)).hour(23).minute(59).second(59).format(DATETIME_FORMAT);
        }
        const point = monitor.getClientOffset();
        let leftIndex = Math.floor((point.x - pos.x) / cellWidth);
        let startTime = resourceEvents.headerItems[leftIndex].start;
        let endTime = resourceEvents.headerItems[leftIndex].end;
        if (cellUnit !== CellUnit.Hour)
          endTime = localeDayjs(new Date(resourceEvents.headerItems[leftIndex].start)).hour(23).minute(59).second(59).format(DATETIME_FORMAT);

        return {
          slotId: resourceEvents.slotId,
          slotName: resourceEvents.slotName,
          start: startTime,
          end: endTime,
          initialStart: initialStartTime,
          initialEnd: initialEndTime
        };
      },

      hover: (props, monitor, component) => {

        const { schedulerData, resourceEvents, movingEvent } = props;
        const { cellUnit, config, viewType, localeDayjs } = schedulerData;
        this.config = config;
        const item = monitor.getItem();
        const type = monitor.getItemType();
        const pos = getPos(component.eventContainer);
        let cellWidth = schedulerData.getContentCellWidth();
        let initialStart = null, initialEnd = null;
        if (type === DnDTypes.EVENT) {
          const initialPoint = monitor.getInitialClientOffset();
          let initialLeftIndex = Math.floor((initialPoint.x - pos.x) / cellWidth);
          initialStart = resourceEvents.headerItems[initialLeftIndex].start;
          initialEnd = resourceEvents.headerItems[initialLeftIndex].end;
          if (cellUnit !== CellUnit.Hour)
            initialEnd = localeDayjs(new Date(resourceEvents.headerItems[initialLeftIndex].start)).hour(23).minute(59).second(59).format(DATETIME_FORMAT);
        }
        const point = monitor.getClientOffset();
        let leftIndex = Math.floor((point.x - pos.x) / cellWidth);
        if (!resourceEvents.headerItems[leftIndex]) {
          return;
        }
        let newStart = resourceEvents.headerItems[leftIndex].start;
        let newEnd = resourceEvents.headerItems[leftIndex].end;
        if (cellUnit !== CellUnit.Hour)
          newEnd = localeDayjs(new Date(resourceEvents.headerItems[leftIndex].start)).hour(23).minute(59).second(59).format(DATETIME_FORMAT);
        let slotId = resourceEvents.slotId, slotName = resourceEvents.slotName;
        let action = 'New';
        let isEvent = type === DnDTypes.EVENT;
        if (isEvent) {
          const event = item;
          if (config.relativeMove) {
            newStart = localeDayjs(event.start).add(localeDayjs(newStart).diff(localeDayjs(new Date(initialStart))), 'ms').format(DATETIME_FORMAT);
          } else {
            if (viewType !== ViewType.Day) {
              let tmpDayjs = localeDayjs(newStart);
              newStart = localeDayjs(event.start).year(tmpDayjs.year()).month(tmpDayjs.month()).date(tmpDayjs.date()).format(DATETIME_FORMAT);
            }
          }
          newEnd = localeDayjs(newStart).add(localeDayjs(event.end).diff(localeDayjs(event.start)), 'ms').format(DATETIME_FORMAT);

          //if crossResourceMove disabled, slot returns old value
          if (config.crossResourceMove === false) {
            slotId = schedulerData._getEventSlotId(item);
            slotName = undefined;
            let slot = schedulerData.getSlotById(slotId);
            if (!!slot)
              slotName = slot.name;
          }

          action = 'Move';
        }

        if (!!movingEvent) {
          movingEvent(schedulerData, slotId, slotName, newStart, newEnd, action, type, item);
        }
      },

      canDrop: (props, monitor) => {
        const { schedulerData, resourceEvents } = props;
        const item = monitor.getItem();
        if (schedulerData._isResizing()) return false;
        const { config } = schedulerData;
        return config.movable && !resourceEvents.groupOnly && (item.movable == undefined || item.movable !== false);
      }
    }
  }

  getDropCollect = (connect, monitor) => {
    return {
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver()
    };
  }

  getDropTarget = (dragAndDropEnabled) => {
    return (dragAndDropEnabled ?
      DropTarget([...this.sourceMap.keys()], this.getDropSpec(), this.getDropCollect)(this.DecoratedComponent) :
      (this.DecoratedComponent)
    );
  }

  getDndSource = (dndType = DnDTypes.EVENT) => {
    return this.sourceMap.get(dndType);
  }
}
